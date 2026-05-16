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

func (s *UserStore) AddUser(user models.User) bool {
	result := s.db.Create(&user)
	if result.Error != nil {
		log.Printf("❌ [STORE] Error adding user: %v", result.Error)
		return false
	}
	log.Printf("🔥 [STORE] User added to DB: %s", user.Email)
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
