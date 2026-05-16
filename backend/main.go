package main

import (
	"backend/handlers"
	"backend/models"
	"backend/store"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
)

func main() {
	// 1. Connect to SQLite Database
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	// 2. Auto Migrate (creates the users table automatically)
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("failed to migrate database")
	}

	app := fiber.New()

	// Use Fiber's logger middleware to log all requests
	app.Use(logger.New())

	// Enable CORS for all origins
	app.Use(cors.New())

	userStore := store.NewUserStore(db)
	authHandler := handlers.NewAuthHandler(userStore)

	app.Post("/api/signup", authHandler.SignupHandler)
	app.Post("/api/login", authHandler.LoginHandler)

	log.Fatal(app.Listen(":8080"))
}
