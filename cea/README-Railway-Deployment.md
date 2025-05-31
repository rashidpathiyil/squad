# Railway Deployment Guide

This guide explains how to deploy the Contact Enrichment Service to Railway as two separate services.

## Overview

Since Railway doesn't support Docker Compose, we need to deploy each service separately:

1. **SearXNG Service** - Search aggregation service
2. **Contact Enrichment Service** - Main application

## Prerequisites

- Railway account ([signup here](https://railway.app))
- GitHub repository with this code
- API keys for AI services (OpenAI, Groq, Anthropic, Gemini)

## Deployment Steps

### Step 1: Deploy SearXNG Service

1. **Create New Railway Project**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository

2. **Configure SearXNG Service**
   - Service name: `searxng-service`
   - Use configuration: `railway-searxng.toml`
   - Or manually set:
     - Dockerfile path: `Dockerfile.searxng`
     - Port: `8080`

3. **Environment Variables for SearXNG**
   ```
   PORT=8080
   SEARXNG_SECRET=your-secret-key-here-change-this
   ```

4. **Deploy and Get Internal URL**
   - Deploy the service
   - Note the internal URL (something like `searxng-service.railway.internal`)

### Step 2: Deploy Contact Enrichment Service

1. **Add Second Service to Project**
   - In the same Railway project, click "Add Service"
   - Choose "GitHub Repo" and select the same repository

2. **Configure Contact Enrichment Service**
   - Service name: `contact-enrichment-service`
   - Use configuration: `railway-contact-enrichment.toml`
   - Or manually set:
     - Dockerfile path: `Dockerfile`
     - Port: `3000`

3. **Environment Variables for Contact Enrichment**
   ```
   NODE_ENV=production
   PORT=3000
   SEARXNG_URL=http://searxng-service.railway.internal:8080
   OPENAI_API_KEY=your-openai-api-key
   GROQ_API_KEY=your-groq-api-key (optional)
   ANTHROPIC_API_KEY=your-anthropic-api-key (optional)
   GEMINI_API_KEY=your-gemini-api-key (optional)
   ```

4. **Generate Public URL**
   - After deployment, click "Generate Domain" for the contact enrichment service
   - This will be your public API endpoint

## Service Communication

- The contact enrichment service connects to SearXNG via Railway's private network
- Use the internal URL: `http://searxng-service.railway.internal:8080`
- No external ports needed for SearXNG (unless you want to access it directly)

## Configuration Files Created

- `railway-contact-enrichment.toml` - Railway config for main service
- `railway-searxng.toml` - Railway config for SearXNG service  
- `Dockerfile.searxng` - Dockerfile for SearXNG service
- `Dockerfile` - Dockerfile for main service (already exists)

## Testing

After deployment, test your API:

```bash
# Test health endpoint
curl https://your-app-name.railway.app/api/health

# Test contact enrichment
curl -X POST https://your-app-name.railway.app/api/enrich \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "company": "Example Corp"}'
```

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check environment variables are set correctly
   - Verify Dockerfile paths in Railway config
   - Check build logs for errors

2. **Services Can't Communicate**
   - Ensure SEARXNG_URL uses the correct internal Railway URL
   - Verify both services are in the same Railway project
   - Check that SearXNG service is running and healthy

3. **API Keys Not Working**
   - Verify API keys are set as environment variables in Railway
   - Check that variable names match exactly (case-sensitive)
   - Ensure API keys have sufficient permissions/credits

### Logs and Monitoring

- View logs in Railway dashboard for each service
- Use Railway's built-in metrics to monitor performance
- Set up alerts for service downtime

## Costs

Railway pricing (as of 2024):
- $5/month hobby plan includes sufficient resources for small/medium usage
- Pay-as-you-go for additional usage
- No sleeping/cold starts (unlike some free tiers)

## Alternative: Manual Deployment

If you prefer not to use the configuration files, you can:

1. Create two separate Railway services manually
2. Set the Dockerfile paths and environment variables through the Railway UI
3. Deploy each service independently

This approach gives you more control but requires more manual configuration. 
