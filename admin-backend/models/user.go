package models

import (
	"crypto/rand"
	"fmt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	CustomerID string `json:"customerId" gorm:"uniqueIndex"`
	Email      string `json:"email" gorm:"uniqueIndex"`
	Password   string `json:"password"`
	Role       string `json:"role" gorm:"default:'customer'"`
}

type SchoolProfile struct {
	gorm.Model
	CustomerID  string `json:"customerId" gorm:"uniqueIndex"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	SchoolName  string `json:"schoolName"`
	SchoolCity  string `json:"schoolCity"`
	SchoolBoard string `json:"schoolBoard"`
	Phone       string `json:"phone"`
}

// SignupRequest matches the payload sent by the frontend
type SignupRequest struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	SchoolName  string `json:"schoolName"`
	SchoolCity  string `json:"schoolCity"`
	SchoolBoard string `json:"schoolBoard"`
	Phone       string `json:"phone"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Response struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

func GenerateCustomerID() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return fmt.Sprintf("SSC-%X", b) // e.g. SSC-A1B2C3D4
}
