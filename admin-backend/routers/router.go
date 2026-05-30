package routers

import (
	"admin-backend/handlers"
	"github.com/gofiber/fiber/v2"
)

type ServerModules struct {
	AuthHandler    *handlers.AuthHandler
	ProductHandler *handlers.ProductHandler
	OrderHandler   *handlers.OrderHandler
}

func SetupRoutes(app *fiber.App, s *ServerModules) {
	// Authentication
	app.Post("/api/admin/login", s.AuthHandler.LoginHandler)

	// Catalog Management (Protected)
	app.Get("/api/admin/products", s.ProductHandler.GetProductsHandler)
	app.Post("/api/admin/products", handlers.AdminMiddleware, s.ProductHandler.AddProductHandler)
	app.Put("/api/admin/products/:id", handlers.AdminMiddleware, s.ProductHandler.UpdateProductHandler)
	app.Delete("/api/admin/products/:id", handlers.AdminMiddleware, s.ProductHandler.DeleteProductHandler)
	app.Post("/api/admin/upload", handlers.AdminMiddleware, s.ProductHandler.UploadImageHandler)

	// Inquiry / Order Management (Protected)
	app.Get("/api/admin/orders", handlers.AdminMiddleware, s.OrderHandler.GetOrdersHandler)
	app.Put("/api/admin/orders/:id", handlers.AdminMiddleware, s.OrderHandler.UpdateOrderHandler)
}
