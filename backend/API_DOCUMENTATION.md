# Contact Enrichment CRM API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Content Type
All requests should include:
```
Content-Type: application/json
```

---

## 🏥 Health Check

### GET /health
Check if the API is running.

**Request:**
```bash
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "contact-enrichment-api"
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "60f1b2a3c4d5e6f7g8h9i0j1",
    "email": "john@example.com",
    "name": "John Doe",
    "isActive": true
  }
}
```

**Validation Rules:**
- `name`: Required
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

---

### POST /auth/login
Authenticate user and get JWT token.

**Request:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f1b2a3c4d5e6f7g8h9i0j1",
    "email": "john@example.com",
    "name": "John Doe",
    "isActive": true
  }
}
```

---

### GET /profile
Get current user profile (requires authentication).

**Request:**
```bash
GET /api/v1/profile
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "60f1b2a3c4d5e6f7g8h9i0j1",
    "email": "john@example.com",
    "name": "John Doe",
    "isActive": true
  }
}
```

---

## 👥 Contact Management Endpoints

All contact endpoints require authentication.

### POST /contacts
Create a new contact.

**Request:**
```bash
POST /api/v1/contacts
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "originalContact": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0123"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Contact created successfully",
  "contact": {
    "_id": "60f1b2a3c4d5e6f7g8h9i0j2",
    "userId": "60f1b2a3c4d5e6f7g8h9i0j1",
    "status": "imported",
    "originalContact": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0123"
    },
    "created_at": "2024-05-30T12:00:00Z",
    "updated_at": "2024-05-30T12:00:00Z"
  }
}
```

---

### POST /contacts/bulk
Import multiple contacts at once.

**Request:**
```bash
POST /api/v1/contacts/bulk
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "contacts": [
    {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-0124"
    },
    {
      "name": "Bob Wilson",
      "email": "bob@example.com",
      "phone": "+1-555-0125"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Bulk import completed",
  "totalCreated": 2,
  "contacts": [
    {
      "_id": "60f1b2a3c4d5e6f7g8h9i0j3",
      "userId": "60f1b2a3c4d5e6f7g8h9i0j1",
      "status": "imported",
      "originalContact": {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "phone": "+1-555-0124"
      },
      "created_at": "2024-05-30T12:00:00Z",
      "updated_at": "2024-05-30T12:00:00Z"
    }
  ],
  "errors": [],
  "totalErrors": 0
}
```

---

### GET /contacts
List contacts with pagination and filtering.

**Request:**
```bash
GET /api/v1/contacts?page=1&pageSize=10&status=enriched&search=alice
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`imported`, `enriched`, `processing`, `failed`)
- `search` (optional): Search in name and email

**Response (200 OK):**
```json
{
  "contacts": [
    {
      "_id": "60f1b2a3c4d5e6f7g8h9i0j3",
      "userId": "60f1b2a3c4d5e6f7g8h9i0j1",
      "status": "enriched",
      "originalContact": {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "phone": "+1-555-0124"
      },
      "enrichedContact": {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "skills": ["JavaScript", "React", "Node.js"]
      },
      "confidenceScores": {
        "name": 95,
        "email": 100,
        "title": 85,
        "company": 90
      },
      "enrichmentSummary": {
        "fieldsEnriched": ["title", "company", "location", "skills"],
        "fieldsNotFound": [],
        "overallConfidence": 92
      },
      "created_at": "2024-05-30T12:00:00Z",
      "updated_at": "2024-05-30T12:05:00Z",
      "enriched_at": "2024-05-30T12:05:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

---

### GET /contacts/:id
Get a specific contact by ID.

**Request:**
```bash
GET /api/v1/contacts/60f1b2a3c4d5e6f7g8h9i0j3
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "contact": {
    "_id": "60f1b2a3c4d5e6f7g8h9i0j3",
    "userId": "60f1b2a3c4d5e6f7g8h9i0j1",
    "status": "enriched",
    "originalContact": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+1-555-0124"
    },
    "enrichedContact": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "bio": "Experienced software engineer with 5+ years in web development",
      "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "socialProfiles": {
        "linkedin": "https://linkedin.com/in/alicejohnson",
        "github": "https://github.com/alicejohnson"
      },
      "industry": "Technology"
    },
    "confidenceScores": {
      "name": 95,
      "email": 100,
      "title": 85,
      "company": 90,
      "location": 80,
      "skills": 75
    },
    "sources": {
      "title": "LinkedIn API",
      "company": "LinkedIn API",
      "location": "IP Geolocation",
      "skills": "GitHub API"
    },
    "enrichmentSummary": {
      "fieldsEnriched": ["title", "company", "location", "bio", "skills", "socialProfiles", "industry"],
      "fieldsNotFound": [],
      "overallConfidence": 87
    },
    "created_at": "2024-05-30T12:00:00Z",
    "updated_at": "2024-05-30T12:05:00Z",
    "enriched_at": "2024-05-30T12:05:00Z"
  }
}
```

---

### POST /contacts/:id/enrich
Enrich a single contact with additional data.

**Request:**
```bash
POST /api/v1/contacts/60f1b2a3c4d5e6f7g8h9i0j3/enrich
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "message": "Contact enriched successfully",
  "contact": {
    "_id": "60f1b2a3c4d5e6f7g8h9i0j3",
    "status": "enriched",
    "enrichedContact": {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "title": "Software Engineer",
      "company": "Tech Corp"
    },
    "confidenceScores": {
      "name": 95,
      "email": 100,
      "title": 85,
      "company": 90
    },
    "enriched_at": "2024-05-30T12:05:00Z"
  }
}
```

---

### POST /contacts/enrich-bulk
Enrich multiple contacts (processed asynchronously).

**Request:**
```bash
POST /api/v1/contacts/enrich-bulk
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "contactIds": [
    "60f1b2a3c4d5e6f7g8h9i0j3",
    "60f1b2a3c4d5e6f7g8h9i0j4",
    "60f1b2a3c4d5e6f7g8h9i0j5"
  ]
}
```

**Response (202 Accepted):**
```json
{
  "message": "Bulk enrichment started",
  "count": 3
}
```

---

### GET /contacts/stats
Get contact statistics for the current user.

**Request:**
```bash
GET /api/v1/contacts/stats
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "totalContacts": 150,
  "enrichedContacts": 120,
  "processingContacts": 5,
  "failedContacts": 3,
  "averageConfidence": 87
}
```

---

## 📊 Contact Status Types

| Status | Description |
|--------|-------------|
| `imported` | Contact has been imported but not enriched |
| `processing` | Contact is currently being enriched |
| `enriched` | Contact has been successfully enriched |
| `failed` | Contact enrichment failed |

---

## 🎯 Confidence Scores

Confidence scores range from 0-100 and indicate the reliability of enriched data:

- **90-100**: Very High Confidence
- **80-89**: High Confidence  
- **70-79**: Medium Confidence
- **60-69**: Low Confidence
- **0-59**: Very Low Confidence

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed: email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization header required"
}
```

### 404 Not Found
```json
{
  "error": "Contact not found"
}
```

### 409 Conflict
```json
{
  "error": "Contact with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🚀 Example Usage

### Complete Flow Example

1. **Register a user:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

2. **Login and get token:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

3. **Create a contact:**
```bash
curl -X POST http://localhost:8080/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"originalContact":{"name":"Jane Smith","email":"jane@example.com"}}'
```

4. **Enrich the contact:**
```bash
curl -X POST http://localhost:8080/api/v1/contacts/CONTACT_ID/enrich \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

5. **Get enriched contact:**
```bash
curl -X GET http://localhost:8080/api/v1/contacts/CONTACT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Environment Variables

Required environment variables:

```bash
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
ENRICHMENT_API_URL=http://localhost:3001/api/contact-enrichment
ENRICHMENT_API_KEY=your-api-key
DB_NAME=contact_enrichment_crm
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 📱 Frontend Integration

The API is designed to work with the Nuxt.js frontend running on `http://localhost:3000`. The frontend can:

- Register and authenticate users
- Import contacts via Excel files
- Display enriched contact data with confidence indicators
- Manage bulk operations
- Export contact data

For frontend integration examples, refer to the frontend codebase at `/frontend`.

---

*Last updated: May 30, 2024* 
