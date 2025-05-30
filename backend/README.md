# Contact Enrichment CRM Backend

A robust Go-based REST API for contact enrichment and CRM functionality built with Gin, MongoDB Atlas, and JWT authentication.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **Contact Management**: Full CRUD operations for contacts
- **Bulk Operations**: Import and enrich multiple contacts at once
- **Contact Enrichment**: Integration with external enrichment APIs
- **Confidence Scoring**: Track data reliability with confidence metrics
- **Data Sources**: Track where enriched data comes from
- **Pagination & Search**: Efficient data retrieval with filtering
- **Statistics**: Get insights into your contact data
- **MongoDB Atlas**: Cloud-native database integration

## 🛠️ Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: go-playground/validator
- **Environment Config**: godotenv

## 📁 Project Structure

```
backend/
├── config/          # Configuration management
├── controllers/     # HTTP request handlers
├── database/        # MongoDB connection & indexing
├── middleware/      # Authentication & CORS middleware
├── models/          # Data structures & validation
├── routes/          # API route definitions
├── services/        # Business logic layer
├── main.go          # Application entry point
├── go.mod           # Go dependencies
├── .env             # Environment variables
├── API_DOCUMENTATION.md
├── Contact_Enrichment_CRM.postman_collection.json
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites

- Go 1.21 or higher
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation Steps

1. **Clone the repository**
```bash
cd /Users/rashidpathiyil/Sites/squad4/backend
```

2. **Install dependencies**
```bash
go mod download
```

3. **Environment Configuration**
Create a `.env` file with the following variables:
```bash
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h
ENRICHMENT_API_URL=http://localhost:3001/api/contact-enrichment
ENRICHMENT_API_KEY=your-enrichment-api-key
DB_NAME=contact_enrichment_crm
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

4. **Run the application**
```bash
go run main.go
```

The API will be available at `http://localhost:8080`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Quick Start

1. **Health Check**
```bash
curl http://localhost:8080/api/v1/health
```

2. **Register a User**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

3. **Login**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

4. **Create a Contact** (requires JWT token)
```bash
curl -X POST http://localhost:8080/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"originalContact":{"name":"Jane Smith","email":"jane@example.com"}}'
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🧪 Testing

### Using Postman

Import the provided Postman collection:
- File: `Contact_Enrichment_CRM.postman_collection.json`
- The collection includes all endpoints with example requests
- Authentication is automatically handled between requests

### Using cURL

Examples are provided in the API documentation for each endpoint.

### Health Check
```bash
curl http://localhost:8080/api/v1/health
```
Expected response:
```json
{
  "status": "healthy",
  "service": "contact-enrichment-api"
}
```

## 🗃️ Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "email": String (unique),
  "password": String (hashed),
  "name": String,
  "isActive": Boolean,
  "created_at": Date,
  "updated_at": Date
}
```

### Contacts Collection
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId (ref: Users),
  "status": String, // "imported", "enriched", "processing", "failed"
  "originalContact": {
    "name": String,
    "email": String,
    "phone": String
  },
  "enrichedContact": {
    "name": String,
    "email": String,
    "title": String,
    "company": String,
    "location": String,
    "bio": String,
    "skills": [String],
    "socialProfiles": Object,
    "industry": String,
    "experience": Object
  },
  "confidenceScores": {
    "name": Number (0-100),
    "email": Number (0-100),
    // ... other fields
  },
  "sources": {
    "title": String,
    "company": String,
    // ... source information
  },
  "enrichmentSummary": {
    "fieldsEnriched": [String],
    "fieldsNotFound": [String],
    "overallConfidence": Number
  },
  "created_at": Date,
  "updated_at": Date,
  "enriched_at": Date
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register a user account
2. Login to receive a JWT token
3. Include the token in the Authorization header: `Bearer <token>`
4. Token expires after 24 hours (configurable)

## 🌐 CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (Frontend)
- `http://localhost:3001` (External services)

## 📊 Contact Enrichment

The system integrates with external APIs to enrich contact data:

- **Enrichment API**: Configurable external service
- **Confidence Scoring**: Each enriched field gets a confidence score (0-100)
- **Source Tracking**: Track where each piece of data came from
- **Bulk Processing**: Enrich multiple contacts asynchronously

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
```bash
GIN_MODE=release
PORT=8080
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

2. **Build the Application**
```bash
go build -o contact-enrichment-api main.go
```

3. **Run the Binary**
```bash
./contact-enrichment-api
```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

## 🤝 Integration with Frontend

This backend is designed to work with the Nuxt.js frontend located at `/frontend`. The frontend provides:

- User registration and login interface
- Contact management dashboard
- Excel file import functionality
- Contact enrichment interface
- Data visualization and statistics

## 📈 Performance Considerations

- **Database Indexing**: Optimized indexes for common queries
- **Connection Pooling**: MongoDB connection pooling for efficiency
- **Pagination**: All list endpoints support pagination
- **Async Processing**: Bulk operations processed asynchronously
- **Error Handling**: Comprehensive error handling and logging

## 🛡️ Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify your MongoDB Atlas IP whitelist includes your current IP
   - Check your connection string format
   - Ensure database user has proper permissions

2. **Authentication Errors**
   - Verify JWT token is valid and not expired
   - Check Authorization header format: `Bearer <token>`

3. **Port Already in Use**
   - Change the PORT environment variable
   - Check if another service is using port 8080

### Debug Mode

Run with debug logging:
```bash
GIN_MODE=debug go run main.go
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Postman Collection](./Contact_Enrichment_CRM.postman_collection.json) - Import for testing
- [Frontend Repository](../frontend/) - Nuxt.js frontend application

---

*Last updated: May 30, 2024* 
