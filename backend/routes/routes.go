package routes

import (
	"contact-enrichment-api/controllers"
	"contact-enrichment-api/middleware"
	"contact-enrichment-api/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	authService *services.AuthService,
	contactService *services.ContactService,
) *gin.Engine {
	router := gin.Default()

	// Apply global middleware
	router.Use(middleware.CORSMiddleware())

	// Create controllers
	authController := controllers.NewAuthController(authService)
	contactController := controllers.NewContactController(contactService)

	// API version 1 routes
	v1 := router.Group("/api/v1")

	// Public routes (no authentication required)
	auth := v1.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	// Health check endpoint
	v1.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "contact-enrichment-api",
		})
	})

	// Protected routes (authentication required)
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware(authService))
	{
		// User profile routes
		protected.GET("/profile", authController.GetProfile)

		// Contact routes
		contacts := protected.Group("/contacts")
		{
			contacts.POST("", contactController.CreateContact)
			contacts.POST("/bulk", contactController.BulkCreateContacts)
			contacts.GET("", contactController.GetContacts)
			contacts.GET("/stats", contactController.GetContactStats)
			contacts.GET("/:id", contactController.GetContactByID)
			contacts.POST("/:id/enrich", contactController.EnrichContact)
			contacts.POST("/enrich-bulk", contactController.BulkEnrichContacts)
		}
	}

	return router
}
