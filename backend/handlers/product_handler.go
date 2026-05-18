package handlers

import (
	"backend/models"
	"backend/store"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

type ProductHandler struct {
	Store *store.ProductStore
}

func NewProductHandler(s *store.ProductStore) *ProductHandler {
	return &ProductHandler{Store: s}
}

func (h *ProductHandler) GetProductsHandler(c *fiber.Ctx) error {
	search := c.Query("search")
	category := c.Query("category")
	subject := c.Query("subject")
	grade := c.Query("grade")

	products, err := h.Store.GetProducts(search, category, subject, grade)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Error fetching products",
			Success: false,
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success":  true,
		"products": products,
	})
}

func (h *ProductHandler) AddProductHandler(c *fiber.Ctx) error {
	var product models.Product
	if err := c.BodyParser(&product); err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid product input",
			Success: false,
		})
	}

	if err := h.Store.AddProduct(product); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Error saving product",
			Success: false,
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Product created successfully",
		"product": product,
	})
}

func (h *ProductHandler) UpdateProductHandler(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid product ID",
			Success: false,
		})
	}

	var product models.Product
	if err := c.BodyParser(&product); err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid product input",
			Success: false,
		})
	}

	if err := h.Store.UpdateProduct(uint(id), product); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Error updating product",
			Success: false,
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Product updated successfully",
	})
}

func (h *ProductHandler) DeleteProductHandler(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Invalid product ID",
			Success: false,
		})
	}

	if err := h.Store.DeleteProduct(uint(id)); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Error deleting product",
			Success: false,
		})
	}

	return c.Status(http.StatusOK).JSON(models.Response{
		Message: "Product deleted successfully",
		Success: true,
	})
}

func (h *ProductHandler) UploadImageHandler(c *fiber.Ctx) error {
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(models.Response{
			Message: "Failed to upload image: No file found",
			Success: false,
		})
	}

	// Make sure the uploads folder exists
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Failed to create uploads directory",
			Success: false,
		})
	}

	// Generate a unique filename using timestamp
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join("uploads", filename)

	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(models.Response{
			Message: "Failed to save file",
			Success: false,
		})
	}

	// Return the file path / URL
	url := fmt.Sprintf("http://localhost:8080/uploads/%s", filename)
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Image uploaded successfully",
		"url":     url,
	})
}

