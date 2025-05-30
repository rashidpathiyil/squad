# Contact Enrichment Service API Documentation

## 🚀 Overview

The Contact Enrichment Service is a secure, standalone API service built with Nitro that enriches contact information using AI-powered web search and data extraction. It takes minimal contact details and returns comprehensive professional information.

## 🔐 Security & Authentication

### Authentication Required
All API endpoints except `/api/health` require authentication using an API key.

### Authentication Methods

#### Method 1: X-API-Key Header
```bash
curl -H "X-API-Key: your_api_key_here" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3001/api/contact-enrichment \
     -d '{"contactInfo": {"name": "John Doe"}}'
```

#### Method 2: Bearer Token
```bash
curl -H "Authorization: Bearer your_api_key_here" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3001/api/contact-enrichment \
     -d '{"contactInfo": {"name": "John Doe"}}'
```

### Security Configuration

#### Option 1: config.toml (Recommended)
```toml
[API_SECURITY]
API_KEY = "your_secure_api_key_here"
REQUIRE_AUTH = true
```

#### Option 2: Environment Variables
```bash
export API_KEY="your_secure_api_key_here"
export REQUIRE_AUTH=true
```

## 📡 API Endpoints

### 1. Service Information
- **Endpoint**: `GET /`
- **Authentication**: None required
- **Description**: Returns service information and API documentation

**Example Response:**
```json
{
  "name": "Contact Enrichment Service",
  "version": "1.0.0",
  "description": "Standalone contact enrichment service built with Nitro",
  "security": {
    "authentication": "API Key required",
    "headers": {
      "X-API-Key": "Your API key",
      "or": "Authorization: Bearer YOUR_API_KEY"
    },
    "note": "All endpoints require authentication except /api/health"
  }
}
```

### 2. Health Check
- **Endpoint**: `GET /api/health`
- **Authentication**: None required
- **Description**: Returns service health status

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-05-29T16:31:46.736Z",
  "service": "contact-enrichment-service",
  "version": "1.0.0"
}
```

### 3. Contact Enrichment
- **Endpoint**: `POST /api/contact-enrichment`
- **Authentication**: Required (API Key)
- **Description**: Enriches contact information using AI

## 🎯 Contact Enrichment API

### Request Format

```json
{
  "contactInfo": {
    "name": "string (optional)",
    "email": "string (optional)",
    "title": "string (optional)",
    "company": "string (optional)",
    "industry": "string (optional)",
    "location": "string (optional)",
    "bio": "string (optional)",
    "skills": ["string"] ,
    "socialProfiles": {
      "linkedin": "string (optional)",
      "github": "string (optional)",
      "twitter": "string (optional)",
      "personalBlog": "string (optional)"
    },
    "phone": "string (optional)"
  },
  "chatModel": {
    "provider": "string (optional, default: openai)",
    "name": "string (optional, default: gpt-3.5-turbo)",
    "customOpenAIKey": "string (optional)",
    "customOpenAIBaseURL": "string (optional)"
  },
  "embeddingModel": {
    "provider": "string (optional, default: openai)",
    "name": "string (optional, default: text-embedding-ada-002)"
  },
  "optimizationMode": "speed | balanced (optional, default: balanced)",
  "systemInstructions": "string (optional)"
}
```

### Response Format

```json
{
  "enrichedContact": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "industry": "Technology",
    "location": "San Francisco, CA",
    "bio": "Experienced software engineer...",
    "skills": ["JavaScript", "Python", "React"],
    "socialProfiles": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "twitter": "@johndoe"
    },
    "phone": "+1-555-0123"
  },
  "confidenceScores": {
    "name": 95,
    "email": 90,
    "title": 85,
    "company": 90,
    "location": 80
  },
  "sources": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "company_website": "https://techcorp.com/team"
  },
  "originalContact": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "enrichmentSummary": {
    "fieldsEnriched": ["title", "company", "industry", "location", "bio", "skills", "socialProfiles"],
    "fieldsNotFound": ["phone"],
    "overallConfidence": 87
  }
}
```

## 📝 Usage Examples

### Basic Contact Enrichment

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "contactInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "company": "Example Corp"
    }
  }'
```

### Email-Only Enrichment

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "contactInfo": {
      "email": "jane.smith@techstartup.com"
    }
  }'
```

### Company + Title Enrichment

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "contactInfo": {
      "company": "Tesla",
      "title": "Chief Technology Officer"
    }
  }'
```

### Custom AI Model Configuration

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "contactInfo": {
      "name": "Emma Wilson",
      "email": "emma@startup.io"
    },
    "chatModel": {
      "provider": "custom_openai",
      "name": "gpt-4",
      "customOpenAIKey": "your-openai-key-here"
    },
    "optimizationMode": "balanced"
  }'
```

## ⚙️ Configuration

### Complete Configuration File (config.toml)

```toml
[GENERAL]
SIMILARITY_MEASURE = "cosine"
KEEP_ALIVE = "5m"

[API_SECURITY]
API_KEY = "your_secure_api_key_here"
REQUIRE_AUTH = true

[MODELS.OPENAI]
API_KEY = "sk-proj-..."

[MODELS.GROQ]
API_KEY = ""

[MODELS.ANTHROPIC]
API_KEY = ""

[MODELS.GEMINI]
API_KEY = ""

[MODELS.CUSTOM_OPENAI]
API_KEY = ""
API_URL = ""
MODEL_NAME = ""

[MODELS.OLLAMA]
API_URL = ""

[MODELS.DEEPSEEK]
API_KEY = ""

[MODELS.LM_STUDIO]
API_URL = ""

[API_ENDPOINTS]
SEARXNG = "http://searxng:8080"
```

### Environment Variables

```bash
# API Security
API_KEY=your_secure_api_key_here
REQUIRE_AUTH=true

# Server Configuration
PORT=3000
NODE_ENV=production

# AI Model Providers
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
DEEPSEEK_API_KEY=

# Custom OpenAI Compatible
CUSTOM_OPENAI_API_KEY=
CUSTOM_OPENAI_API_URL=
CUSTOM_OPENAI_MODEL_NAME=

# Local AI Services
OLLAMA_API_URL=http://localhost:11434
LM_STUDIO_API_URL=http://localhost:1234

# Search Services
SEARXNG_URL=http://searxng:8080
```

## 🧪 Testing

### Using the Test Script

```bash
# Set your API key
export API_KEY="your_secure_api_key_here"

# Make the script executable
chmod +x test-api.sh

# Run all tests
./test-api.sh
```

### Manual Testing Commands

#### Test Health (No Auth)
```bash
curl -s http://localhost:3001/api/health
```

#### Test Authentication Failure
```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"name": "Test"}}'
```

#### Test Successful Authentication
```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secure_api_key_here" \
  -d '{"contactInfo": {"name": "Test"}}'
```

## 🚨 Error Responses

### Authentication Error (401)
```json
{
  "error": true,
  "statusCode": 500,
  "statusMessage": "Contact enrichment error: Unauthorized: Valid API key required. Provide it via X-API-Key header or Authorization: Bearer token",
  "message": "Contact enrichment error: Unauthorized: Valid API key required. Provide it via X-API-Key header or Authorization: Bearer token"
}
```

### Bad Request (400)
```json
{
  "error": true,
  "statusCode": 400,
  "statusMessage": "Contact information is required"
}
```

### Insufficient Information (400)
```json
{
  "error": true,
  "statusCode": 400,
  "statusMessage": "At least one of the following is required: name, email, or company+title combination"
}
```

## 🔧 Deployment

### Docker Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f contact-enrichment

# Restart service
docker-compose restart contact-enrichment

# Stop services
docker-compose down
```

### Production Considerations

1. **API Key Security**: Use strong, unique API keys in production
2. **HTTPS**: Deploy behind a reverse proxy with SSL/TLS
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **Monitoring**: Monitor the `/api/health` endpoint
5. **Logging**: Review logs for security events and errors

## 📊 Supported AI Providers

- **OpenAI**: GPT-3.5, GPT-4 models
- **Groq**: Fast inference models
- **Anthropic**: Claude models
- **Google**: Gemini models
- **DeepSeek**: DeepSeek models
- **Ollama**: Local AI models
- **LM Studio**: Local AI models
- **Custom OpenAI**: Compatible APIs

## 🛡️ Security Best Practices

1. **Strong API Keys**: Use randomly generated, long API keys
2. **Environment Variables**: Store sensitive keys in environment variables
3. **Regular Rotation**: Rotate API keys periodically
4. **Access Logging**: Monitor API access patterns
5. **HTTPS Only**: Always use HTTPS in production
6. **Input Validation**: Service validates all input data
7. **Error Handling**: Detailed errors without exposing sensitive information

## 📞 Support

For issues or questions:
1. Check the service health: `GET /api/health`
2. Review the logs: `docker-compose logs contact-enrichment`
3. Verify API key configuration
4. Test with the provided test script

---

**Contact Enrichment Service v1.0.0**  
Built with Nitro • Secured with API Key Authentication • AI-Powered Enrichment 
