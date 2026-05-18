package main

import (
	"backend/handlers"
	"backend/models"
	"backend/store"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// 1. Connect to SQLite Database
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	// 2. Auto Migrate (creates the users and products tables automatically)
	err = db.AutoMigrate(&models.User{}, &models.Product{})
	if err != nil {
		log.Fatal("failed to migrate database")
	}

	// 3. Seed product data if empty
	seedProducts(db)

	app := fiber.New()

	// Use Fiber's logger middleware to log all requests
	app.Use(logger.New())

	// Enable CORS for all origins
	app.Use(cors.New())

	userStore := store.NewUserStore(db)
	authHandler := handlers.NewAuthHandler(userStore)

	productStore := store.NewProductStore(db)
	productHandler := handlers.NewProductHandler(productStore)

	// 4. Ensure uploads folder exists and serve static uploads
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		log.Printf("⚠️ Warning: Failed to create uploads directory: %v", err)
	}
	app.Static("/uploads", "./uploads")

	app.Post("/api/signup", authHandler.SignupHandler)
	app.Post("/api/login", authHandler.LoginHandler)

	// Public catalog route
	app.Get("/api/products", productHandler.GetProductsHandler)

	// Protected catalog management routes
	app.Post("/api/products", handlers.JWTMiddleware, productHandler.AddProductHandler)
	app.Put("/api/products/:id", handlers.JWTMiddleware, productHandler.UpdateProductHandler)
	app.Delete("/api/products/:id", handlers.JWTMiddleware, productHandler.DeleteProductHandler)
	app.Post("/api/upload", handlers.JWTMiddleware, productHandler.UploadImageHandler)

	log.Fatal(app.Listen(":8080"))
}

func seedProducts(db *gorm.DB) {
	var count int64
	db.Model(&models.Product{}).Count(&count)
	if count > 0 {
		return // Database already seeded
	}

	products := []models.Product{
		{
			Name:        "Premium Monocular Microscope",
			Category:    "Instruments",
			Price:       4999.00,
			Image:       "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60",
			Description: "High-resolution school-grade monocular microscope with LED illumination, 40x-1000x magnification. Ideal for biology laboratory classes.",
			Stock:       45,
			Grade:       "High School",
			Subject:     "Biology",
		},
		{
			Name:        "Human Skeleton Anatomical Model",
			Category:    "Models",
			Price:       7500.00,
			Image:       "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=500&auto=format&fit=crop&q=60",
			Description: "Life-size 170cm height male human skeleton model with stand. Features moveable joints, detachable skull, and realistic bone texture.",
			Stock:       15,
			Grade:       "Middle School",
			Subject:     "Biology",
		},
		{
			Name:        "Physics Mechanics Laboratory Kit",
			Category:    "Kits",
			Price:       3200.00,
			Image:       "https://images.unsplash.com/photo-1517420712361-29400d29b751?w=500&auto=format&fit=crop&q=60",
			Description: "Comprehensive kit containing pulleys, masses, friction board, inclined plane, spring balances, and cart. Perfect for demonstrating Newton's laws.",
			Stock:       30,
			Grade:       "High School",
			Subject:     "Physics",
		},
		{
			Name:        "Borosilicate Glassware Starter Set",
			Category:    "Glassware",
			Price:       1850.00,
			Image:       "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=500&auto=format&fit=crop&q=60",
			Description: "Includes 5x Beakers (50ml-1000ml), 3x Conical Flasks, 2x Graduated Cylinders, and 5x Glass Stirring Rods. Premium heat-resistant borosilicate glass.",
			Stock:       80,
			Grade:       "Middle School",
			Subject:     "Chemistry",
		},
		{
			Name:        "Premium Digital PH Meter",
			Category:    "Instruments",
			Price:       1250.00,
			Image:       "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=500&auto=format&fit=crop&q=60",
			Description: "Handheld digital pH tester with high accuracy and auto-calibration. Ideal for chemistry acid-base titrations and biology water testing.",
			Stock:       60,
			Grade:       "High School",
			Subject:     "Chemistry",
		},
		{
			Name:        "Fraction & Geometry Math Kit",
			Category:    "Kits",
			Price:       990.00,
			Image:       "https://images.unsplash.com/photo-1453733190148-c44698c265f8?w=500&auto=format&fit=crop&q=60",
			Description: "Includes fraction tiles, geoboard, 3D geometric shapes, and a protractor set. Designed to visually teach concepts of geometry and fractions.",
			Stock:       50,
			Grade:       "Primary",
			Subject:     "Mathematics",
		},
		{
			Name:        "Prepared Microscope Slide Set (50pcs)",
			Category:    "Models",
			Price:       1100.00,
			Image:       "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
			Description: "50 high-quality glass slides containing plant, insect, and animal tissues. Packaged in a durable protective wooden storage case.",
			Stock:       120,
			Grade:       "Middle School",
			Subject:     "Biology",
		},
		{
			Name:        "Handheld Magnetic Compass",
			Category:    "Instruments",
			Price:       250.00,
			Image:       "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60",
			Description: "Liquid-filled magnetic compass in a sturdy brass body. Used for studying magnetic fields and navigation concepts.",
			Stock:       200,
			Grade:       "Primary",
			Subject:     "Physics",
		},
	}

	for _, p := range products {
		db.Create(&p)
	}
	log.Println("🌱 [SEED] Successfully seeded 8 scientific equipment products!")
}
