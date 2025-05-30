#!/bin/bash

# Contact Enrichment Service API Test Script
# Make sure the service is running on http://localhost:3001

BASE_URL="http://localhost:3001"

# Default API key (change this to your actual API key)
API_KEY=${API_KEY:-"your_secure_api_key_here"}

echo "🔍 Contact Enrichment Service API Tests"
echo "========================================"
echo "🔑 Using API Key: ${API_KEY:0:10}..."
echo ""

# Test 1: Health Check (no auth required)
echo "📋 Testing Health Check..."
curl -s "$BASE_URL/api/health" | jq .
echo ""

# Test 2: Basic Contact Enrichment
echo "👤 Testing Basic Contact Enrichment..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "contactInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "company": "Example Corp"
    }
  }' | jq .
echo ""

# Test 3: Minimal Contact (Email Only)
echo "📧 Testing Minimal Contact (Email Only)..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "contactInfo": {
      "email": "jane.smith@techstartup.com"
    }
  }' | jq .
echo ""

# Test 4: Company + Title Combination
echo "🏢 Testing Company + Title Combination..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "contactInfo": {
      "company": "Tesla",
      "title": "Chief Technology Officer"
    }
  }' | jq .
echo ""

# Test 5: With Custom API Key (replace with real key)
echo "🔑 Testing with Custom API Key..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "contactInfo": {
      "name": "Emma Wilson",
      "email": "emma@startup.io"
    },
    "chatModel": {
      "provider": "custom_openai",
      "name": "gpt-3.5-turbo",
      "customOpenAIKey": "your-real-api-key-here"
    }
  }' | jq .
echo ""

# Test 6: Authentication Test (no API key)
echo "🔒 Testing Authentication (no API key - should fail)..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -d '{
    "contactInfo": {
      "name": "Test User",
      "email": "test@example.com"
    }
  }' | jq .
echo ""

# Test 7: Invalid Request (no contact info)
echo "❌ Testing Invalid Request (no contact info)..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{}' | jq .
echo ""

# Test 8: Invalid Request (insufficient identifying info)
echo "❌ Testing Invalid Request (insufficient identifying info)..."
curl -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "contactInfo": {
      "bio": "Just a bio without identifying information"
    }
  }' | jq .
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "📝 Usage Notes:"
echo "   🔑 Set API_KEY environment variable: export API_KEY='your_api_key_here'"
echo "   🚀 The service is running on: $BASE_URL"
echo "   📖 API Documentation: $BASE_URL"
echo "   🔐 Authentication: X-API-Key header or Authorization: Bearer token"
echo "" 
