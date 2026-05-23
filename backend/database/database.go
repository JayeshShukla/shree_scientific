package database

import (
	"backend/models"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	var err error
	DB, err = gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ failed to connect database:", err)
	}

	log.Println("🔌 Connected to SQLite successfully")

	// Auto Migrate models
	err = DB.AutoMigrate(
		&models.User{},
		&models.SchoolProfile{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatal("❌ failed to migrate database:", err)
	}

	log.Println("🛠️ Database tables migrated successfully")

	// Seed product data
	SeedProducts(DB)

	return DB
}
