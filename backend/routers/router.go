package routers

import (
	"backend/handlers"
	"github.com/gofiber/fiber/v2"
)

type ServerModules struct {
	AuthHandler    *handlers.AuthHandler
	ProductHandler *handlers.ProductHandler
	OrderHandler   *handlers.OrderHandler
}

func SetupRoutes(app *fiber.App, s *ServerModules) {
	// Authentication API endpoints
	app.Post("/api/signup", s.AuthHandler.SignupHandler)
	app.Post("/api/login", s.AuthHandler.LoginHandler)

	// Catalog API endpoints
	app.Get("/api/products", s.ProductHandler.GetProductsHandler)
	app.Post("/api/products", handlers.JWTMiddleware, s.ProductHandler.AddProductHandler)
	app.Put("/api/products/:id", handlers.JWTMiddleware, s.ProductHandler.UpdateProductHandler)
	app.Delete("/api/products/:id", handlers.JWTMiddleware, s.ProductHandler.DeleteProductHandler)
	app.Post("/api/upload", handlers.JWTMiddleware, s.ProductHandler.UploadImageHandler)

	// Order / Quotation API endpoints
	app.Post("/api/orders", handlers.JWTMiddleware, s.OrderHandler.CreateOrderHandler)
	app.Get("/api/orders", handlers.JWTMiddleware, s.OrderHandler.GetOrdersHandler)
	app.Patch("/api/orders/:id/purchase", handlers.JWTMiddleware, s.OrderHandler.PurchaseQuotationHandler)
	app.Delete("/api/orders/:id", handlers.JWTMiddleware, s.OrderHandler.DeleteQuotationHandler)
}
