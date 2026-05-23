package main

import (
	"backend/database"
	"backend/handlers"
	"backend/routers"
	"backend/services"
	"backend/store"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ No .env file found, using system environment variables")
	}

	// Initialize Database (Connects, Automigrates, and Seeds)
	db := database.InitDB()

	// Initialize Fiber Router App
	app := fiber.New()

	// Use Fiber's logger middleware to log all requests
	app.Use(logger.New())

	// Enable CORS for all origins
	app.Use(cors.New())

	// Initialize Stores & Handlers
	userStore := store.NewUserStore(db)
	authHandler := handlers.NewAuthHandler(userStore)

	productStore := store.NewProductStore(db)
	productHandler := handlers.NewProductHandler(productStore)

	orderStore := store.NewOrderStore(db)
	emailService := services.NewEmailService()
	orderHandler := handlers.NewOrderHandler(orderStore, emailService)

	// Ensure uploads folder exists and serve static uploads
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		log.Printf("⚠️ Warning: Failed to create uploads directory: %v", err)
	}
	app.Static("/uploads", "./uploads")

	// Set up application routers using ServerModules
	modules := &routers.ServerModules{
		AuthHandler:    authHandler,
		ProductHandler: productHandler,
		OrderHandler:   orderHandler,
	}
	routers.SetupRoutes(app, modules)

	// Listen and serve on port 8080
	log.Fatal(app.Listen(":8080"))
}
