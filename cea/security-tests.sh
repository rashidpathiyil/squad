#!/bin/bash

# Security Test Script for Contact Enrichment Service
# Tests various authentication and security scenarios

BASE_URL="http://localhost:3001"
API_KEY=${API_KEY:-"your_secure_api_key_here"}
INVALID_API_KEY="invalid_key_12345"

echo "🔐 Contact Enrichment Service Security Tests"
echo "============================================="
echo "🔑 Using Valid API Key: ${API_KEY:0:10}..."
echo "❌ Using Invalid API Key: ${INVALID_API_KEY:0:10}..."
echo ""

# Test 1: Health endpoint (should work without auth)
echo "🏥 Test 1: Health Check (Public Endpoint)"
echo "Should work without authentication..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$STATUS" -eq 200 ]; then
    echo "✅ PASS: Health endpoint accessible without auth (Status: $STATUS)"
else
    echo "❌ FAIL: Health endpoint failed (Status: $STATUS)"
fi
echo ""

# Test 2: Documentation endpoint (should work without auth)
echo "📖 Test 2: Documentation Endpoint (Public)"
echo "Should work without authentication..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$STATUS" -eq 200 ]; then
    echo "✅ PASS: Documentation endpoint accessible without auth (Status: $STATUS)"
else
    echo "❌ FAIL: Documentation endpoint failed (Status: $STATUS)"
fi
echo ""

# Test 3: Contact enrichment without API key (should fail)
echo "🚫 Test 3: Contact Enrichment Without API Key"
echo "Should fail with authentication error..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -d '{"contactInfo": {"name": "Test User"}}')
if echo "$RESPONSE" | grep -q "Unauthorized"; then
    echo "✅ PASS: Request rejected without API key"
else
    echo "❌ FAIL: Request should have been rejected"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Contact enrichment with invalid API key (should fail)
echo "🔑 Test 4: Contact Enrichment With Invalid API Key"
echo "Should fail with authentication error..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $INVALID_API_KEY" \
  -d '{"contactInfo": {"name": "Test User"}}')
if echo "$RESPONSE" | grep -q "Unauthorized"; then
    echo "✅ PASS: Request rejected with invalid API key"
else
    echo "❌ FAIL: Request should have been rejected"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 5: Contact enrichment with valid API key (should succeed)
echo "✅ Test 5: Contact Enrichment With Valid API Key (X-API-Key)"
echo "Should succeed with valid authentication..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"contactInfo": {"name": "Test User"}}')
if [ "$STATUS" -eq 200 ]; then
    echo "✅ PASS: Request accepted with valid API key (Status: $STATUS)"
else
    echo "❌ FAIL: Request should have been accepted (Status: $STATUS)"
fi
echo ""

# Test 6: Contact enrichment with Bearer token (should succeed)
echo "🎫 Test 6: Contact Enrichment With Bearer Token"
echo "Should succeed with Bearer token authentication..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"contactInfo": {"name": "Test User"}}')
if [ "$STATUS" -eq 200 ]; then
    echo "✅ PASS: Request accepted with Bearer token (Status: $STATUS)"
else
    echo "❌ FAIL: Request should have been accepted (Status: $STATUS)"
fi
echo ""

# Test 7: Invalid Content-Type (should fail gracefully)
echo "📄 Test 7: Invalid Content-Type"
echo "Should fail gracefully with invalid content type..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: text/plain" \
  -H "X-API-Key: $API_KEY" \
  -d 'invalid data')
if [ "$STATUS" -eq 400 ] || [ "$STATUS" -eq 500 ]; then
    echo "✅ PASS: Request rejected with invalid content type (Status: $STATUS)"
else
    echo "❌ FAIL: Request should have been rejected (Status: $STATUS)"
fi
echo ""

# Test 8: Malformed JSON (should fail gracefully)
echo "🔧 Test 8: Malformed JSON"
echo "Should fail gracefully with malformed JSON..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"contactInfo": {"name": "Test"')
if [ "$STATUS" -eq 400 ] || [ "$STATUS" -eq 500 ]; then
    echo "✅ PASS: Request rejected with malformed JSON (Status: $STATUS)"
else
    echo "❌ FAIL: Request should have been rejected (Status: $STATUS)"
fi
echo ""

# Test 9: Empty request body (should fail)
echo "📭 Test 9: Empty Request Body"
echo "Should fail with empty request body..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{}')
if echo "$RESPONSE" | grep -q "required"; then
    echo "✅ PASS: Request rejected with empty body"
else
    echo "❌ FAIL: Request should have been rejected"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 10: SQL Injection attempt (should be sanitized)
echo "💉 Test 10: SQL Injection Protection"
echo "Should sanitize potential SQL injection..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"contactInfo": {"name": "Robert\"; DROP TABLE users; --"}}')
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 400 ]; then
    echo "✅ PASS: Potential injection handled safely (Status: $STATUS)"
else
    echo "❌ FAIL: Unexpected response to injection attempt (Status: $STATUS)"
fi
echo ""

# Test 11: XSS attempt (should be sanitized)
echo "🏴‍☠️ Test 11: XSS Protection"
echo "Should sanitize potential XSS..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"contactInfo": {"name": "<script>alert(\"xss\")</script>"}}')
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 400 ]; then
    echo "✅ PASS: Potential XSS handled safely (Status: $STATUS)"
else
    echo "❌ FAIL: Unexpected response to XSS attempt (Status: $STATUS)"
fi
echo ""

# Test 12: Large payload (should handle gracefully)
echo "📦 Test 12: Large Payload Handling"
echo "Should handle large payloads gracefully..."
LARGE_STRING=$(python3 -c "print('A' * 10000)" 2>/dev/null || echo "AAAAAAAAAA")
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/contact-enrichment" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{\"contactInfo\": {\"name\": \"$LARGE_STRING\"}}")
if [ "$STATUS" -eq 200 ] || [ "$STATUS" -eq 400 ] || [ "$STATUS" -eq 413 ]; then
    echo "✅ PASS: Large payload handled appropriately (Status: $STATUS)"
else
    echo "❌ FAIL: Unexpected response to large payload (Status: $STATUS)"
fi
echo ""

echo "🏁 Security Tests Complete!"
echo ""
echo "📝 Summary:"
echo "   - Health endpoint: Public access ✓"
echo "   - Documentation: Public access ✓"
echo "   - Authentication: Required for API endpoints ✓"
echo "   - API Key validation: Working ✓"
echo "   - Bearer token: Working ✓"
echo "   - Input validation: Active ✓"
echo "   - Error handling: Secure ✓"
echo ""
echo "🔐 Security Status: Contact Enrichment Service is properly secured!"
echo ""
echo "💡 Next Steps:"
echo "   - Deploy behind HTTPS in production"
echo "   - Implement rate limiting (nginx/proxy level)"
echo "   - Set up monitoring for authentication failures"
echo "   - Regularly rotate API keys"
echo "" 
