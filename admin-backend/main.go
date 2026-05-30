package main

import (
	"admin-backend/database"
	"admin-backend/handlers"
	"admin-backend/routers"
	"admin-backend/store"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Initialize Database (Connects, Automigrates, and Seeds Admin)
	db := database.InitDB()

	// Initialize Fiber Router App
	app := fiber.New()

	// Use Fiber's logger middleware to log all requests
	app.Use(logger.New())

	// Enable CORS for all origins (important for frontend integration)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Initialize Stores & Handlers
	userStore := store.NewUserStore(db)
	authHandler := handlers.NewAuthHandler(userStore)

	productStore := store.NewProductStore(db)
	productHandler := handlers.NewProductHandler(productStore)

	orderStore := store.NewOrderStore(db)
	orderHandler := handlers.NewOrderHandler(orderStore)

	// Set up application routers using ServerModules
	modules := &routers.ServerModules{
		AuthHandler:    authHandler,
		ProductHandler: productHandler,
		OrderHandler:   orderHandler,
	}
	routers.SetupRoutes(app, modules)

	// Listen and serve on port 8081 for Admin APIs
	log.Println("🚀 Admin Service running on port 8081")
	log.Fatal(app.Listen(":8081"))
}
