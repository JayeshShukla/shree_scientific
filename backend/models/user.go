package models

type User struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email" gorm:"uniqueIndex"`
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
