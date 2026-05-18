package handlers

import (
	"backend/models"
	"backend/store"
	"github.com/gofiber/fiber/v2"
	"net/http"
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
