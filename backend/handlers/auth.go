package handlers

import (
	"backend/models"
	"backend/store"
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

func (h *AuthHandler) SignupHandler(c *fiber.Ctx) error {
	var req models.SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.Response{Message: "Invalid input", Success: false})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.Response{Message: "Email and password are required", Success: false})
	}

	if !h.Store.AddUser(req) {
		log.Printf("Signup failed: User already exists -> %s", req.Email)
		return c.Status(fiber.StatusConflict).JSON(models.Response{Message: "User already exists", Success: false})
	}

	log.Printf("User signed up successfully: %s", req.Email)
	return c.Status(fiber.StatusCreated).JSON(models.Response{Message: "User created successfully", Success: true})
}

func (h *AuthHandler) LoginHandler(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.Response{Message: "Invalid input", Success: false})
	}

	user, exists := h.Store.GetUser(req.Email)
	if !exists || user.Password != req.Password {
		log.Printf("Login failed: Invalid credentials for -> %s", req.Email)
		return c.Status(fiber.StatusUnauthorized).JSON(models.Response{Message: "Invalid email or password", Success: false})
	}

	// Generate JWT signed token containing customerId
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":      req.Email,
		"customerId": user.CustomerID,
		"exp":        time.Now().Add(time.Hour * 24).Unix(), // Expires in 24 hours
	})

	tokenString, err := token.SignedString([]byte(JWTSecret))
	if err != nil {
		log.Printf("Error signing JWT token: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.Response{Message: "Error generating token", Success: false})
	}

	log.Printf("User logged in successfully: %s", req.Email)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"token":   tokenString,
	})
}
