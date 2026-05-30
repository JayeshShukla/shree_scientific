package handlers

import (
	"admin-backend/models"
	"admin-backend/store"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	Store *store.UserStore
}

func NewAuthHandler(store *store.UserStore) *AuthHandler {
	return &AuthHandler{Store: store}
}

func (h *AuthHandler) LoginHandler(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.Response{Message: "Invalid input", Success: false})
	}

	user, exists := h.Store.GetUser(req.Email)
	if !exists || user.Password != req.Password {
		log.Printf("Admin Login failed: Invalid credentials for -> %s", req.Email)
		return c.Status(fiber.StatusUnauthorized).JSON(models.Response{Message: "Invalid email or password", Success: false})
	}

	// Verify that the user is an admin
	if user.Role != "admin" {
		log.Printf("Admin Login failed: User is not an admin -> %s", req.Email)
		return c.Status(fiber.StatusForbidden).JSON(models.Response{Message: "Forbidden: Not an admin account", Success: false})
	}

	// Generate JWT signed token containing customerId and role
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":      req.Email,
		"customerId": user.CustomerID,
		"role":       user.Role,
		"exp":        time.Now().Add(time.Hour * 24).Unix(), // Expires in 24 hours
	})

	tokenString, err := token.SignedString([]byte(JWTSecret))
	if err != nil {
		log.Printf("Error signing admin JWT token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.Response{Message: "Error generating token", Success: false})
	}

	log.Printf("Admin logged in successfully: %s", req.Email)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Admin login successful",
		"token":   tokenString,
	})
}
