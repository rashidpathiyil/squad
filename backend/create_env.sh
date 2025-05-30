#!/bin/bash

# Create .env file for development
cat > .env << 'EOF'
PORT=8080
MONGODB_URI=mongodb://localhost:27017/contact_enrichment_crm
JWT_SECRET=your-super-secret-jwt-key-development-only
JWT_EXPIRATION=24h
ENRICHMENT_API_URL=http://localhost:3001/api/contact-enrichment
ENRICHMENT_API_KEY=your-enrichment-api-key-here
DB_NAME=contact_enrichment_crm
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Timeout configurations
DEFAULT_TIMEOUT=30s
BULK_OPERATION_TIMEOUT=10m
ENRICHMENT_TIMEOUT=60s
EOF

echo ".env file created successfully with timeout configurations!" 
