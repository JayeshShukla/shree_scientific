package store

import (
	"backend/models"
	"log"
	"gorm.io/gorm"
)

type OrderStore struct {
	db *gorm.DB
}

func NewOrderStore(db *gorm.DB) *OrderStore {
	return &OrderStore{db: db}
}

func (s *OrderStore) CreateOrder(customerID string, email string, itemsReq []models.CreateOrderItem) (models.Order, error) {
	var order models.Order
	var user models.User
	var profile models.SchoolProfile

	// 1. Fetch User (fallback to email if customerID is empty)
	if customerID != "" {
		if err := s.db.Where("customer_id = ?", customerID).First(&user).Error; err != nil {
			return order, err
		}
	} else {
		if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
			return order, err
		}
		customerID = user.CustomerID
	}

	// 2. Fetch School Profile
	if err := s.db.Where("customer_id = ?", customerID).First(&profile).Error; err != nil {
		log.Printf("⚠️ Warning: Profile not found for customer %s, using empty defaults", customerID)
	}

	// Populate details on Order
	order.CustomerID = customerID
	order.UserEmail = user.Email
	order.SchoolName = profile.SchoolName
	order.SchoolCity = profile.SchoolCity
	order.SchoolBoard = profile.SchoolBoard
	order.Phone = profile.Phone
	order.Status = "quotation"

	var activeCount int64
	if err := s.db.Model(&models.Order{}).
		Where("customer_id = ? AND status IN ?", customerID, []string{"quotation", "pending"}).
		Count(&activeCount).Error; err != nil {
		return order, err
	}
	order.QuotationNo = int(activeCount) + 1

	var subTotal float64

	// 3. Fetch products and build order items
	var orderItems []models.OrderItem
	for _, reqItem := range itemsReq {
		var product models.Product
		if err := s.db.First(&product, reqItem.ProductID).Error; err != nil {
			return order, err
		}

		amount := float64(reqItem.Quantity) * product.Price
		subTotal += amount

		orderItem := models.OrderItem{
			ProductID:   product.ID,
			ProductName: product.Name,
			Quantity:    reqItem.Quantity,
			Rate:        product.Price,
			Amount:      amount,
		}
		orderItems = append(orderItems, orderItem)
	}

	order.SubTotal = subTotal
	order.Freight = 0
	order.GrandTotal = subTotal + order.Freight
	order.Items = orderItems

	// 4. Save order and order items in a transaction
	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		return nil
	})

	return order, err
}

func (s *OrderStore) GetOrdersByUser(customerID string, email string, statusFilter string) ([]models.Order, error) {
	var orders []models.Order
	query := s.db.Preload("Items")
	if customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	} else {
		query = query.Where("user_email = ?", email)
	}

	switch statusFilter {
	case "active":
		query = query.Where("status IN ?", []string{"quotation", "pending"})
	case "completed":
		query = query.Where("status = ?", "completed")
	}

	err := query.Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (s *OrderStore) CompleteOrder(orderID uint, customerID string, email string) (models.Order, error) {
	var order models.Order
	q := s.db.Preload("Items")
	if customerID != "" {
		q = q.Where("customer_id = ? AND id = ?", customerID, orderID)
	} else {
		q = q.Where("user_email = ? AND id = ?", email, orderID)
	}
	if err := q.First(&order).Error; err != nil {
		return order, err
	}

	if order.Status == "completed" {
		return order, gorm.ErrRecordNotFound // treat as already done
	}

	var completedCount int64
	if err := s.db.Model(&models.Order{}).
		Where("customer_id = ? AND status = ?", order.CustomerID, "completed").
		Count(&completedCount).Error; err != nil {
		return order, err
	}

	order.Status = "completed"
	order.QuotationNo = int(completedCount) + 1
	if err := s.db.Save(&order).Error; err != nil {
		return order, err
	}
	return order, nil
}

func (s *OrderStore) DeleteOrder(orderID uint, customerID string, email string) error {
	var order models.Order
	q := s.db
	if customerID != "" {
		q = q.Where("customer_id = ? AND id = ?", customerID, orderID)
	} else {
		q = q.Where("user_email = ? AND id = ?", email, orderID)
	}
	if err := q.First(&order).Error; err != nil {
		return err
	}

	if order.Status == "completed" {
		return gorm.ErrRecordNotFound
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("order_id = ?", order.ID).Delete(&models.OrderItem{}).Error; err != nil {
			return err
		}
		return tx.Delete(&order).Error
	})
}
