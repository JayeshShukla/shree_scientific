package database

import (
	"admin-backend/models"
	"log"

	"gorm.io/gorm"
)

func SeedAdminUser(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count > 0 {
		return // Admin user already exists
	}

	admin := models.User{
		CustomerID: "ADMIN-001",
		Email:      "admin@shreescientific.com",
		Password:   "admin", // In a production system, this would be hashed (bcrypt)
		Role:       "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Printf("❌ Failed to seed admin user: %v", err)
		return
	}

	// Create school profile for Admin just to prevent foreign key or join errors
	profile := models.SchoolProfile{
		CustomerID:  "ADMIN-001",
		FirstName:   "Shree Scientific",
		LastName:    "Administrator",
		SchoolName:  "Shree Scientific Center",
		SchoolCity:  "Balaghat",
		SchoolBoard: "Other",
		Phone:       "9340120216",
	}

	db.Create(&profile)

	log.Println("👤 [SEED] Successfully seeded admin user (admin@shreescientific.com / admin)")
}
