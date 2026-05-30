package handlers

import (
	"admin-backend/models"
	"admin-backend/store"
	"log"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	Store *store.OrderStore
}

func NewOrderHandler(s *store.OrderStore) *OrderHandler {
	return &OrderHandler{
		Store: s,
	}
}

func (h *OrderHandler) GetOrdersHandler(c *fiber.Ctx) error {
	orders, err := h.Store.GetAllOrders()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Failed to fetch orders",
			Success: false,
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"orders":  orders,
	})
}

func (h *OrderHandler) UpdateOrderHandler(c *fiber.Ctx) error {
	idParam := c.Params("id")
	orderID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid order ID",
			Success: false,
		})
	}

	var req models.UpdateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid input data",
			Success: false,
		})
	}

	freightVal, _ := strconv.ParseFloat(req.Freight, 64)

	updatedOrder, err := h.Store.UpdateOrder(uint(orderID), freightVal, req.Status, req.Items)
	if err != nil {
		log.Printf("Error updating order %d: %v", orderID, err)
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Failed to update order details",
			Success: false,
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Order updated successfully",
		"order":   updatedOrder,
	})
}
