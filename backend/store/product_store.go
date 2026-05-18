package store

import (
	"backend/models"
	"gorm.io/gorm"
)

type ProductStore struct {
	db *gorm.DB
}

func NewProductStore(db *gorm.DB) *ProductStore {
	return &ProductStore{
		db: db,
	}
}

func (s *ProductStore) GetProducts(search, category, subject, grade string) ([]models.Product, error) {
	var products []models.Product
	query := s.db.Model(&models.Product{})

	if search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if subject != "" {
		query = query.Where("subject = ?", subject)
	}
	if grade != "" {
		query = query.Where("grade = ?", grade)
	}

	err := query.Find(&products).Error
	return products, err
}

func (s *ProductStore) AddProduct(product models.Product) error {
	return s.db.Create(&product).Error
}
