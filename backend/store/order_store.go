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
	order.Status = "pending"

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

func (s *OrderStore) GetOrdersByUser(customerID string, email string) ([]models.Order, error) {
	var orders []models.Order
	var err error
	if customerID != "" {
		err = s.db.Preload("Items").Where("customer_id = ?", customerID).Find(&orders).Error
	} else {
		err = s.db.Preload("Items").Where("user_email = ?", email).Find(&orders).Error
	}
	return orders, err
}
