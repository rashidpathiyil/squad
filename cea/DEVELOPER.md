# 👨‍💻 Contact Enrichment Service - Developer Guide

Welcome to the Contact Enrichment Service! This guide will help you understand, develop, and contribute to this AI-powered contact enrichment platform.

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Quick Start](#-quick-start)
4. [Development Setup](#-development-setup)
5. [Code Structure](#-code-structure)
6. [API Reference](#-api-reference)
7. [Testing](#-testing)
8. [Deployment](#-deployment)
9. [Troubleshooting](#-troubleshooting)
10. [Contributing](#-contributing)

## 🎯 Project Overview

### What is Contact Enrichment Service?

A standalone microservice that enriches contact information using:
- **AI Models**: OpenAI GPT, GROQ, Anthropic Claude, Google Gemini
- **Web Search**: Integrated SEARXNG for real-time web data
- **Data Sources**: LinkedIn, GitHub, company websites, news articles

### Key Features

- 🤖 **Multi-AI Support**: Switch between different LLM providers
- 🔍 **Privacy-First Search**: Uses open-source SEARXNG (no Google API keys)
- 🐳 **Container-Ready**: Full Docker support with health checks
- ⚡ **High Performance**: Built on Nitro framework
- 📊 **Confidence Scoring**: AI provides confidence metrics for enriched data
- 🔧 **Extensible**: Easy to add new AI providers and data sources

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  Nitro Server   │───▶│    AI Models    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    SEARXNG      │
                       │  Search Engine  │
                       └─────────────────┘
```

### Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Nitro (Universal JavaScript server)
- **Search Engine**: SEARXNG (Open-source metasearch)
- **AI Integration**: LangChain for multiple providers
- **Containerization**: Docker + Docker Compose
- **Configuration**: TOML + Environment Variables

### Component Breakdown

| Component | Purpose | Technology |
|-----------|---------|------------|
| `server/` | API endpoints and routing | Nitro/H3 |
| `lib/config.ts` | Configuration management | TOML parsing |
| `lib/providers.ts` | AI model providers | LangChain |
| `lib/search.ts` | Web search and data extraction | Axios + Cheerio |
| `searxng/` | Search engine configuration | SEARXNG Docker |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- OpenAI API Key (minimum requirement)

### 1-Minute Setup

```bash
# Clone and enter directory
git clone <your-repo>
cd contact-enrichment-service

# Configure environment
cp env.example .env
# Edit .env with your API keys

# Start everything
docker-compose up -d

# Test the service
curl http://localhost:3001/api/health
```

## 🛠️ Development Setup

### Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp env.example .env
   ```

3. **Edit `.env` file**:
   ```env
   NODE_ENV=development
   PORT=3000
   OPENAI_API_KEY=your_openai_key_here
   SEARXNG_URL=http://localhost:4001
   ```

4. **Configure `config.toml`**:
   ```toml
   [MODELS.OPENAI]
   API_KEY = "your_openai_key_here"
   
   [API_ENDPOINTS]
   SEARXNG = "http://localhost:4001"
   ```

### Development Workflow

#### Start SEARXNG (Required)
```bash
docker-compose up searxng -d
```

#### Start Development Server
```bash
npm run dev
```

#### Alternative: Full Docker Development
```bash
docker-compose up -d
docker-compose logs -f contact-enrichment
```

### Hot Reloading

The Nitro server supports hot reloading in development mode:
- Changes to `server/`, `lib/` files trigger automatic restart
- Configuration changes require manual restart

## 📁 Code Structure

### Directory Layout

```
contact-enrichment-service/
├── 📁 server/                    # API endpoints
│   ├── 📁 api/
│   │   ├── contact-enrichment.post.ts  # Main enrichment endpoint
│   │   └── health.get.ts               # Health check
│   └── 📁 routes/
│       └── index.get.ts                # API documentation
│
├── 📁 lib/                       # Core business logic
│   ├── config.ts                 # Configuration management
│   ├── providers.ts              # AI model providers
│   └── search.ts                 # Search and enrichment logic
│
├── 📁 searxng/                   # SEARXNG configuration
│   ├── settings.yml              # Search engine settings
│   ├── uwsgi.ini                # UWSGI server config
│   └── limiter.toml             # Rate limiting
│
├── 📄 nitro.config.ts            # Nitro server configuration
├── 📄 docker-compose.yaml       # Multi-service orchestration
├── 📄 Dockerfile               # Container definition
├── 📄 config.toml              # Application configuration
└── 📄 package.json             # Dependencies and scripts
```

### Key Files Explained

#### `lib/config.ts`
- Loads configuration from TOML files and environment variables
- Provides getter functions for API keys and endpoints
- Handles Docker vs local development differences

#### `lib/providers.ts`
- Initializes AI model providers (OpenAI, GROQ, etc.)
- Handles provider-specific configurations
- Returns available models for the API

#### `lib/search.ts`
- Core enrichment logic
- SEARXNG integration for web search
- Content extraction from websites
- AI prompting and response parsing

#### `server/api/contact-enrichment.post.ts`
- Main API endpoint for contact enrichment
- Input validation and sanitization
- Response formatting and error handling

### Configuration System

The service uses a layered configuration approach:

1. **config.toml** (persistent config)
2. **Environment variables** (runtime overrides)
3. **Docker environment** (container-specific)

Priority: Environment Variables > Docker Config > TOML File > Defaults

## 📡 API Reference

### POST `/api/contact-enrichment`

Enriches contact information using AI and web search.

#### Request Body

```typescript
interface EnrichmentRequest {
  contactInfo: {
    name?: string;
    email?: string;
    title?: string;
    company?: string;
    industry?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    socialProfiles?: {
      linkedin?: string;
      github?: string;
      twitter?: string;
    };
    phone?: string;
  };
  chatModel?: {
    provider: 'openai' | 'groq' | 'anthropic' | 'gemini' | 'ollama';
    name: string;
    customOpenAIKey?: string;
    customOpenAIBaseURL?: string;
  };
  embeddingModel?: {
    provider: string;
    name: string;
  };
  optimizationMode?: 'speed' | 'balanced';
  systemInstructions?: string;
}
```

#### Response Format

```typescript
interface EnrichmentResponse {
  enrichedContact: ContactInfo;
  confidenceScores: Record<string, number | Record<string, number>>;
  sources: Record<string, string>;
  originalContact: ContactInfo;
  enrichmentSummary: {
    fieldsEnriched: string[];
    fieldsNotFound: string[];
    overallConfidence: number;
  };
}
```

#### Example Usage

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "Satya Nadella",
      "company": "Microsoft"
    },
    "chatModel": {
      "provider": "openai",
      "name": "gpt-4"
    },
    "optimizationMode": "balanced"
  }'
```

### GET `/api/health`

Returns service health status and configuration.

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "searxng": "connected",
  "models": ["openai", "groq"],
  "version": "1.0.0"
}
```

### GET `/`

Returns interactive API documentation with examples.

## 🧪 Testing

### Manual Testing

#### Test Script
```bash
chmod +x test-api.sh
./test-api.sh
```

#### Manual API Tests
```bash
# Health check
curl http://localhost:3001/api/health

# Basic enrichment
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"name": "Test User", "company": "Test Corp"}}'

# SEARXNG connectivity
curl "http://localhost:4001/search?q=test&format=json"
```

### Unit Testing (Future)

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- search.test.ts
```

### Integration Testing

The `test-payloads.json` file contains various test scenarios:
- Valid contact info
- Missing required fields
- Invalid model configurations
- Edge cases and error conditions

## 🚀 Deployment

### Docker Production Deployment

1. **Configure production environment**:
   ```bash
   cp env.example .env
   # Set production API keys
   ```

2. **Build and start services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify deployment**:
   ```bash
   curl http://localhost:3001/api/health
   ```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_production_key
SEARXNG_URL=http://searxng:8080
```

### Scaling Considerations

- **Horizontal Scaling**: Multiple container instances behind a load balancer
- **SEARXNG Scaling**: Separate SEARXNG cluster for high-volume usage
- **Caching**: Add Redis for search result caching
- **Rate Limiting**: Configure appropriate limits in SEARXNG

### Health Checks

The service includes built-in health checks:
- **API Health**: `/api/health` endpoint
- **Docker Health**: Container-level health checks
- **SEARXNG Health**: Automatic connectivity testing

## 🔧 Troubleshooting

### Common Issues

#### 1. SEARXNG Not Accessible
```bash
# Check SEARXNG logs
docker-compose logs searxng

# Test connectivity
curl http://localhost:4001/search?q=test&format=json

# Restart SEARXNG
docker-compose restart searxng
```

#### 2. API Key Errors
```bash
# Verify API key in config
cat config.toml | grep API_KEY

# Check environment variables
echo $OPENAI_API_KEY

# Test API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### 3. Port Conflicts
```bash
# Check what's using ports
lsof -i :3001
lsof -i :4001

# Change ports in docker-compose.yaml
```

#### 4. Docker Build Issues
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
DEBUG=nitro:*
```

### Performance Issues

1. **Slow enrichment responses**:
   - Check SEARXNG response times
   - Verify AI model performance
   - Consider using faster models (gpt-3.5-turbo vs gpt-4)

2. **Memory usage**:
   - Monitor container resource usage
   - Adjust Docker memory limits
   - Check for memory leaks in logs

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow provided configuration
- **Prettier**: Auto-formatting on save
- **Naming**: camelCase for variables, PascalCase for types

### Adding New AI Providers

1. **Update `lib/providers.ts`**:
   ```typescript
   // Add new provider configuration
   if (newProviderApiKey) {
     providers.newProvider = {
       'model-name': new NewProviderChat({...})
     };
   }
   ```

2. **Update `lib/config.ts`**:
   ```typescript
   // Add configuration getter
   export const getNewProviderApiKey = (): string => 
     getConfig().MODELS.NEW_PROVIDER.API_KEY;
   ```

3. **Update `config.toml`**:
   ```toml
   [MODELS.NEW_PROVIDER]
   API_KEY = ""
   ```

### Adding New Search Sources

1. **Extend `lib/search.ts`**:
   ```typescript
   // Add new search strategy
   const searchNewSource = async (query: string) => {
     // Implementation
   };
   ```

2. **Update search orchestration**:
   ```typescript
   // Add to main search function
   const allSources = await Promise.all([
     searchSearxng(query),
     searchNewSource(query),
     // ... other sources
   ]);
   ```

### Testing New Features

1. **Add test cases** to `test-payloads.json`
2. **Update test script** if needed
3. **Document new functionality** in README and this guide
4. **Verify Docker deployment** works

### Documentation Updates

When adding features, update:
- **README.md**: User-facing documentation
- **DEVELOPER.md**: This developer guide
- **API documentation**: In-code examples
- **Docker files**: If infrastructure changes

## 📚 Additional Resources

### Useful Links

- [Nitro Framework Documentation](https://nitro.unjs.io/)
- [LangChain Documentation](https://js.langchain.com/)
- [SEARXNG Documentation](https://docs.searxng.org/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### External APIs

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GROQ API Documentation](https://console.groq.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Google AI Studio](https://ai.google.dev/)

### Community

- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Wiki**: Community-maintained documentation

---

**Happy coding! 🚀**

*If you have questions or need help, don't hesitate to open an issue or reach out to the team.* 
