package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	CustomerID  string      `json:"customerId"`
	UserEmail   string      `json:"userEmail"`
	SchoolName  string      `json:"schoolName"`
	SchoolCity  string      `json:"schoolCity"`
	SchoolBoard string      `json:"schoolBoard"`
	Phone       string      `json:"phone"`
	SubTotal    float64     `json:"subTotal"`
	Freight     float64     `json:"freight"`
	GrandTotal  float64     `json:"grandTotal"`
	Status      string      `json:"status"` // e.g. "pending", "completed", "approved", "shipped"
	Items       []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	gorm.Model
	OrderID     uint    `json:"orderId"`
	ProductID   uint    `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	Rate        float64 `json:"rate"`
	Amount      float64 `json:"amount"`
}

type CreateOrderRequest struct {
	Items []CreateOrderItem `json:"items"`
}

type CreateOrderItem struct {
	ProductID uint `json:"productId"`
	Quantity  int  `json:"quantity"`
}

type UpdateOrderRequest struct {
	Freight string            `json:"freight"`
	Status  string            `json:"status"`
	Items   []UpdateOrderItem `json:"items"`
}

type UpdateOrderItem struct {
	ID       uint    `json:"id"`
	Quantity int     `json:"quantity"`
	Rate     float64 `json:"rate"`
}
