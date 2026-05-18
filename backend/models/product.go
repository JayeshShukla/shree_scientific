package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Category    string  `json:"category"`    // e.g. Glassware, Instruments, Models, Kits
	Price       float64 `json:"price"`
	Image       string  `json:"image"`       // Unsplash image or local path
	Description string  `json:"description"`
	Stock       int     `json:"stock"`
	Grade       string  `json:"grade"`       // e.g. Primary, Middle School, High School
	Subject     string  `json:"subject"`     // e.g. Physics, Chemistry, Biology, Mathematics
}
