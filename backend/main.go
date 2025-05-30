package main

import (
	"log"

	"contact-enrichment-api/config"
	"contact-enrichment-api/database"
	"contact-enrichment-api/routes"
	"contact-enrichment-api/services"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.NewConnection(cfg.MongoURI, cfg.DBName)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("Error closing database connection: %v", err)
		}
	}()

	// Initialize services
	authService := services.NewAuthService(db.DB, cfg)
	contactService := services.NewContactService(db.DB, cfg)

	// Setup routes
	router := routes.SetupRoutes(authService, contactService)

	// Start server
	log.Printf("Starting server on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
