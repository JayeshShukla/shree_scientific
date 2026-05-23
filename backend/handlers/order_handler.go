package handlers

import (
	"backend/models"
	"backend/services"
	"backend/store"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	Store        *store.OrderStore
	EmailService *services.EmailService
}

func NewOrderHandler(s *store.OrderStore, e *services.EmailService) *OrderHandler {
	return &OrderHandler{
		Store:        s,
		EmailService: e,
	}
}

func (h *OrderHandler) CreateOrderHandler(c *fiber.Ctx) error {
	emailVal := c.Locals("email")
	customerIDVal := c.Locals("customerId")
	
	if emailVal == nil {
		return c.Status(http.StatusUnauthorized).JSON(models.Response{
			Message: "Unauthorized: Missing user credentials",
			Success: false,
		})
	}
	email := emailVal.(string)

	var customerID string
	if customerIDVal != nil {
		customerID = customerIDVal.(string)
	}

	var req models.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid order input data",
			Success: false,
		})
	}

	if len(req.Items) == 0 {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Order must contain at least one item",
			Success: false,
		})
	}

	// 1. Save order to database
	order, err := h.Store.CreateOrder(customerID, email, req.Items)
	if err != nil {
		log.Printf("❌ [HANDLER] Error creating order: %v", err)
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Failed to process order request",
			Success: false,
		})
	}

	// 2. Send email notification (saves HTML locally and sends via SMTP if config exists)
	go func(o models.Order) {
		if err := h.EmailService.SendQuotationEmail(o); err != nil {
			log.Printf("⚠️ [HANDLER] Failed to send quotation email: %v", err)
		}
	}(order)

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Order placed successfully. Quotation has been generated and queued for email delivery.",
		"order":   order,
	})
}

func (h *OrderHandler) GetOrdersHandler(c *fiber.Ctx) error {
	emailVal := c.Locals("email")
	customerIDVal := c.Locals("customerId")

	if emailVal == nil {
		return c.Status(http.StatusUnauthorized).JSON(models.Response{
			Message: "Unauthorized",
			Success: false,
		})
	}
	email := emailVal.(string)

	var customerID string
	if customerIDVal != nil {
		customerID = customerIDVal.(string)
	}

	orders, err := h.Store.GetOrdersByUser(customerID, email)
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
