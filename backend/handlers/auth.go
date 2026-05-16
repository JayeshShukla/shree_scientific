package handlers

import (
	"backend/models"
	"backend/store"
	"github.com/gofiber/fiber/v2"
	"log"
)

type AuthHandler struct {
	Store *store.UserStore
}

func NewAuthHandler(store *store.UserStore) *AuthHandler {
	return &AuthHandler{Store: store}
}

func (h *AuthHandler) SignupHandler(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.Response{Message: "Invalid input", Success: false})
	}

	if user.Email == "" || user.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.Response{Message: "Email and password are required", Success: false})
	}

	if !h.Store.AddUser(user) {
		log.Printf("Signup failed: User already exists -> %s", user.Email)
		return c.Status(fiber.StatusConflict).JSON(models.Response{Message: "User already exists", Success: false})
	}

	log.Printf("User signed up successfully: %s", user.Email)
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

	log.Printf("User logged in successfully: %s", req.Email)
	return c.Status(fiber.StatusOK).JSON(models.Response{Message: "Login successful", Success: true})
}
