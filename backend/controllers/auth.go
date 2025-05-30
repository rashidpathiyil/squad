package controllers

import (
	"net/http"

	"contact-enrichment-api/models"
	"contact-enrichment-api/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AuthController struct {
	authService *services.AuthService
	validator   *validator.Validate
}

func NewAuthController(authService *services.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
		validator:   validator.New(),
	}
}

func (ac *AuthController) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ac.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ac.authService.Register(req)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	response := models.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Name:     user.Name,
		IsActive: user.IsActive,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    response,
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ac.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	loginResponse, err := ac.authService.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	userResponse := models.UserResponse{
		ID:       loginResponse.User.ID,
		Email:    loginResponse.User.Email,
		Name:     loginResponse.User.Name,
		IsActive: loginResponse.User.IsActive,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   loginResponse.Token,
		"user":    userResponse,
	})
}

func (ac *AuthController) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user, err := ac.authService.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	response := models.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Name:     user.Name,
		IsActive: user.IsActive,
	}

	c.JSON(http.StatusOK, gin.H{"user": response})
}
