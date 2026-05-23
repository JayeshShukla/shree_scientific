package store

import (
	"backend/models"
	"log"
	"gorm.io/gorm"
)

type UserStore struct {
	db *gorm.DB
}

func NewUserStore(db *gorm.DB) *UserStore {
	return &UserStore{
		db: db,
	}
}

func (s *UserStore) AddUser(req models.SignupRequest) bool {
	err := s.db.Transaction(func(tx *gorm.DB) error {
		customerID := models.GenerateCustomerID()

		user := models.User{
			CustomerID: customerID,
			Email:      req.Email,
			Password:   req.Password,
		}

		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		profile := models.SchoolProfile{
			CustomerID:  customerID,
			FirstName:   req.FirstName,
			LastName:    req.LastName,
			SchoolName:  req.SchoolName,
			SchoolCity:  req.SchoolCity,
			SchoolBoard: req.SchoolBoard,
			Phone:       req.Phone,
		}

		if err := tx.Create(&profile).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		log.Printf("❌ [STORE] Error registering user: %v", err)
		return false
	}

	log.Printf("🔥 [STORE] User registered successfully: %s", req.Email)
	return true
}

func (s *UserStore) GetUser(email string) (models.User, bool) {
	var user models.User
	result := s.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return user, false
	}
	return user, true
}

func (s *UserStore) GetSchoolProfile(customerID string) (models.SchoolProfile, bool) {
	var profile models.SchoolProfile
	result := s.db.Where("customer_id = ?", customerID).First(&profile)
	if result.Error != nil {
		return profile, false
	}
	return profile, true
}
