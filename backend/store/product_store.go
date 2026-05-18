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

func (s *ProductStore) UpdateProduct(id uint, updatedProduct models.Product) error {
	var product models.Product
	if err := s.db.First(&product, id).Error; err != nil {
		return err
	}
	product.Name = updatedProduct.Name
	product.Category = updatedProduct.Category
	product.Price = updatedProduct.Price
	product.Image = updatedProduct.Image
	product.Description = updatedProduct.Description
	product.Stock = updatedProduct.Stock
	product.Grade = updatedProduct.Grade
	product.Subject = updatedProduct.Subject
	return s.db.Save(&product).Error
}

func (s *ProductStore) DeleteProduct(id uint) error {
	return s.db.Delete(&models.Product{}, id).Error
}

