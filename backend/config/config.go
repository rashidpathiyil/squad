package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	MongoURI         string
	DBName           string
	JWTSecret        string
	JWTExpiration    time.Duration
	EnrichmentAPIURL string
	EnrichmentAPIKey string
	CORSOrigins      []string

	// Timeout configurations
	DefaultTimeout       time.Duration
	BulkOperationTimeout time.Duration
	EnrichmentTimeout    time.Duration
}

func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		Port:             getEnv("PORT", "8080"),
		MongoURI:         getEnv("MONGODB_URI", "mongodb://localhost:27017/contact_enrichment_crm"),
		DBName:           getEnv("DB_NAME", "contact_enrichment_crm"),
		JWTSecret:        getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		EnrichmentAPIURL: getEnv("ENRICHMENT_API_URL", "http://localhost:3001/api/contact-enrichment"),
		EnrichmentAPIKey: getEnv("ENRICHMENT_API_KEY", "your_secure_api_key_here"),
		CORSOrigins:      []string{getEnv("CORS_ORIGINS", "http://localhost:3000")},

		// Default timeout configurations
		DefaultTimeout:       parseDuration("DEFAULT_TIMEOUT", "30s"),
		BulkOperationTimeout: parseDuration("BULK_OPERATION_TIMEOUT", "5m"),
		EnrichmentTimeout:    parseDuration("ENRICHMENT_TIMEOUT", "30s"),
	}

	// Parse JWT expiration
	expStr := getEnv("JWT_EXPIRATION", "24h")
	duration, err := time.ParseDuration(expStr)
	if err != nil {
		log.Printf("Invalid JWT_EXPIRATION format, using default 24h: %v", err)
		duration = 24 * time.Hour
	}
	config.JWTExpiration = duration

	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseDuration(key, defaultValue string) time.Duration {
	valueStr := getEnv(key, defaultValue)
	duration, err := time.ParseDuration(valueStr)
	if err != nil {
		log.Printf("Invalid %s format, using default %s: %v", key, defaultValue, err)
		duration, _ = time.ParseDuration(defaultValue)
	}
	return duration
}
