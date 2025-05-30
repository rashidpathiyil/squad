# ⚡ Quick Start Guide for Developers

Get the Contact Enrichment Service running in 5 minutes!

## 🎯 Prerequisites

- **Node.js 18+** (Check: `node --version`)
- **Docker & Docker Compose** (Check: `docker --version`)
- **Git** (Check: `git --version`)
- **OpenAI API Key** (Get one from [OpenAI Platform](https://platform.openai.com/))

## 🚀 1-Minute Docker Setup

```bash
# 1. Clone and navigate
git clone <your-repo-url>
cd contact-enrichment-service

# 2. Configure environment
cp env.example .env
# Edit .env and add your OpenAI API key

# 3. Start everything
docker-compose up -d

# 4. Test the service
curl http://localhost:3001/api/health
```

**✅ That's it! Your service is running on `http://localhost:3001`**

## 🛠️ Development Setup

### Option 1: Full Docker Development

```bash
# Start everything in Docker
docker-compose up -d

# Watch logs
docker-compose logs -f contact-enrichment

# Stop everything
docker-compose down
```

### Option 2: Hybrid Development (Recommended)

```bash
# Install dependencies
npm install

# Start only SEARXNG in Docker
docker-compose up searxng -d

# Start API in development mode
npm run dev
```

## 🧪 Quick Tests

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Basic Contact Enrichment
```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "Elon Musk",
      "company": "Tesla"
    }
  }'
```

### Test SEARXNG
```bash
curl "http://localhost:4001/search?q=test&format=json" | head -5
```

### Run Test Suite
```bash
chmod +x test-api.sh
./test-api.sh
```

## 📊 Service Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /` | API Documentation | `curl http://localhost:3001/` |
| `GET /api/health` | Health Check | `curl http://localhost:3001/api/health` |
| `POST /api/contact-enrichment` | Main API | See examples below |
| `GET http://localhost:4001` | SEARXNG Web UI | Open in browser |

## 🔧 Configuration Quick Reference

### Environment Variables (`.env`)

```env
# Required
OPENAI_API_KEY=your_openai_key_here

# Optional
NODE_ENV=development
PORT=3000
SEARXNG_URL=http://localhost:4001

# Additional AI Providers (Optional)
GROQ_API_KEY=your_groq_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
```

### Config File (`config.toml`)

```toml
[MODELS.OPENAI]
API_KEY = "your_openai_key_here"

[API_ENDPOINTS]
SEARXNG = "http://localhost:4001"
```

## 🎮 Common Use Cases

### 1. Basic Contact Enrichment

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "Tim Cook",
      "company": "Apple"
    }
  }'
```

### 2. Email-Based Enrichment

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "email": "satya@microsoft.com"
    }
  }'
```

### 3. Specify AI Model

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "Jensen Huang",
      "company": "NVIDIA"
    },
    "chatModel": {
      "provider": "openai",
      "name": "gpt-4"
    }
  }'
```

### 4. Custom Instructions

```bash
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "Marc Benioff",
      "company": "Salesforce"
    },
    "systemInstructions": "Focus on finding technical background and recent achievements"
  }'
```

## 🐛 Troubleshooting Quick Fixes

### Issue: "SEARXNG not accessible"
```bash
# Check if SEARXNG is running
docker ps | grep searxng

# Restart SEARXNG
docker-compose restart searxng

# Check logs
docker-compose logs searxng
```

### Issue: "OpenAI API error"
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: "Port already in use"
```bash
# Check what's using the port
lsof -i :3001
lsof -i :4001

# Kill the process or change ports in docker-compose.yaml
```

### Issue: "Container build fails"
```bash
# Clean Docker cache
docker system prune -f

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 📁 Project Structure Overview

```
contact-enrichment-service/
├── 🐳 docker-compose.yaml    # Multi-service orchestration
├── 🐳 Dockerfile            # Container definition
├── ⚙️  config.toml           # Configuration
├── 📄 package.json          # Dependencies
├── 📁 server/               # API endpoints
├── 📁 lib/                  # Core logic
├── 📁 searxng/              # Search engine config
└── 🧪 test-api.sh           # Test script
```

## 🔄 Development Workflow

### 1. Make Changes
```bash
# Edit files in server/ or lib/
# Hot reload works in development mode
```

### 2. Test Changes
```bash
# Run manual tests
./test-api.sh

# Or test specific endpoint
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"name": "Test User"}}'
```

### 3. Check Logs
```bash
# Development mode logs
npm run dev

# Docker logs
docker-compose logs -f contact-enrichment
```

### 4. Restart Services
```bash
# Development mode (auto-restart)
# Just save your files

# Docker mode
docker-compose restart contact-enrichment
```

## 🎨 Adding Features

### Add New AI Provider
1. Edit `lib/providers.ts`
2. Add configuration in `lib/config.ts`
3. Update `config.toml` and `env.example`
4. Test with new provider

### Add New Search Source
1. Edit `lib/search.ts`
2. Add new search function
3. Integrate with main search orchestration
4. Test with various queries

### Add New API Endpoint
1. Create file in `server/api/` or `server/routes/`
2. Follow Nitro conventions
3. Add to API documentation
4. Write tests

## 📚 Next Steps

Once you have the service running:

1. **Read the Full Docs**:
   - `DEVELOPER.md` - Complete developer guide
   - `ARCHITECTURE.md` - Technical deep dive
   - `README.md` - User documentation

2. **Explore the Code**:
   - Start with `server/api/contact-enrichment.post.ts`
   - Look at `lib/search.ts` for core logic
   - Check `lib/providers.ts` for AI integration

3. **Try Advanced Features**:
   - Multiple AI providers
   - Custom search strategies
   - Different optimization modes

4. **Join the Community**:
   - Report issues on GitHub
   - Contribute improvements
   - Share your use cases

## 🆘 Getting Help

- **Check logs**: `docker-compose logs -f`
- **Run health check**: `curl http://localhost:3001/api/health`
- **Verify configuration**: `cat config.toml`
- **Test components**: `./test-api.sh`
- **Ask for help**: Open an issue on GitHub

---

**Happy coding! 🚀**

*You're now ready to develop with the Contact Enrichment Service!* 
