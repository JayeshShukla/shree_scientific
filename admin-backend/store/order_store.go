package store

import (
	"admin-backend/models"
	"gorm.io/gorm"
)

type OrderStore struct {
	db *gorm.DB
}

func NewOrderStore(db *gorm.DB) *OrderStore {
	return &OrderStore{db: db}
}

// GetAllOrders fetches all orders in the system for admin view
func (s *OrderStore) GetAllOrders() ([]models.Order, error) {
	var orders []models.Order
	err := s.db.Preload("Items").Order("created_at desc").Find(&orders).Error
	return orders, err
}

// GetOrderById fetches a single order
func (s *OrderStore) GetOrderById(id uint) (models.Order, error) {
	var order models.Order
	err := s.db.Preload("Items").First(&order, id).Error
	return order, err
}

// UpdateOrder updates the freight, status, and item rates/quantities in a transaction
func (s *OrderStore) UpdateOrder(id uint, freight float64, status string, itemsReq []models.UpdateOrderItem) (models.Order, error) {
	var order models.Order

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Fetch current order
		if err := tx.Preload("Items").First(&order, id).Error; err != nil {
			return err
		}

		// 2. Map and update order items
		var subTotal float64
		for _, reqItem := range itemsReq {
			var dbItem models.OrderItem
			if err := tx.First(&dbItem, reqItem.ID).Error; err != nil {
				return err
			}

			dbItem.Quantity = reqItem.Quantity
			dbItem.Rate = reqItem.Rate
			dbItem.Amount = float64(reqItem.Quantity) * reqItem.Rate
			
			if err := tx.Save(&dbItem).Error; err != nil {
				return err
			}
		}

		// Recalculate subtotal from database to make sure it's accurate
		var allItems []models.OrderItem
		if err := tx.Where("order_id = ?", id).Find(&allItems).Error; err != nil {
			return err
		}

		for _, item := range allItems {
			subTotal += item.Amount
		}

		// 3. Update order fields
		order.SubTotal = subTotal
		order.Freight = freight
		order.GrandTotal = subTotal + freight
		if status != "" {
			order.Status = status
		}

		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// Re-fetch updated order with items
		return tx.Preload("Items").First(&order, id).Error
	})

	return order, err
}
