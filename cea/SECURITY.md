# Security Documentation

## 🔐 Security Overview

The Contact Enrichment Service implements API key-based authentication to secure all endpoints and protect sensitive contact enrichment operations.

## 🛡️ Authentication & Authorization

### Authentication Methods

#### 1. X-API-Key Header (Recommended)
```bash
curl -H "X-API-Key: your_api_key_here" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3001/api/contact-enrichment \
     -d '{"contactInfo": {"name": "John Doe"}}'
```

#### 2. Authorization Bearer Token
```bash
curl -H "Authorization: Bearer your_api_key_here" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3001/api/contact-enrichment \
     -d '{"contactInfo": {"name": "John Doe"}}'
```

### Protected Endpoints
- ✅ **`POST /api/contact-enrichment`** - Requires API key
- ✅ **All future API endpoints** - Require API key by default

### Public Endpoints (No Authentication)
- 🌐 **`GET /`** - Service documentation
- 🏥 **`GET /api/health`** - Health check for monitoring

## ⚙️ Security Configuration

### Configuration Priority
1. **config.toml** (highest priority)
2. **Environment variables** (fallback)
3. **Default values** (development only)

### Option 1: config.toml Configuration
```toml
[API_SECURITY]
API_KEY = "your_secure_api_key_here"
REQUIRE_AUTH = true
```

### Option 2: Environment Variables
```bash
export API_KEY="your_secure_api_key_here"
export REQUIRE_AUTH=true
```

### Option 3: Docker Environment
```yaml
# docker-compose.yaml
environment:
  - API_KEY=your_secure_api_key_here
  - REQUIRE_AUTH=true
```

## 🔑 API Key Management

### Production API Key Requirements
- **Minimum length**: 32 characters
- **Character set**: Alphanumeric + special characters
- **Entropy**: High randomness
- **Uniqueness**: Unique per environment/client

### Recommended API Key Generation
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generators (use with caution)
# Only use for development, never for production
```

### API Key Storage Best Practices
1. **Never commit** API keys to version control
2. **Use environment variables** in production
3. **Encrypt at rest** when stored in databases
4. **Limit scope** - one key per service/environment
5. **Regular rotation** - change keys periodically

## 🚨 Error Handling & Security

### Authentication Failure Response
```json
{
  "error": true,
  "statusCode": 500,
  "statusMessage": "Contact enrichment error: Unauthorized: Valid API key required. Provide it via X-API-Key header or Authorization: Bearer token",
  "message": "Contact enrichment error: Unauthorized: Valid API key required. Provide it via X-API-Key header or Authorization: Bearer token"
}
```

### Security Error Types
- **401 Unauthorized**: Missing or invalid API key
- **400 Bad Request**: Invalid request format
- **500 Internal Error**: Service errors (wrapped securely)

## 🛡️ Security Features

### Input Validation
- ✅ **Request body validation**: All input fields validated
- ✅ **Header validation**: API key format verification
- ✅ **Content-Type checking**: JSON content type required
- ✅ **Rate limiting ready**: Service ready for rate limiting implementation

### Data Protection
- ✅ **No sensitive data logging**: API keys never logged
- ✅ **Error sanitization**: Internal errors don't expose sensitive information
- ✅ **Input sanitization**: All user input validated and sanitized

### Network Security
- ✅ **Docker isolation**: Service runs in isolated container
- ✅ **Port binding**: Only necessary ports exposed
- ✅ **HTTPS ready**: Can be deployed behind SSL/TLS proxy

## 🔧 Production Security Checklist

### Pre-Deployment
- [ ] **Strong API key generated** (32+ characters)
- [ ] **API key stored securely** (environment variables)
- [ ] **config.toml updated** with production settings
- [ ] **Test authentication** with test script
- [ ] **HTTPS proxy configured** (recommended)

### Deployment Security
- [ ] **Container security**: Latest base images used
- [ ] **Network isolation**: Proper Docker network configuration
- [ ] **File permissions**: Secure file permissions set
- [ ] **Log security**: No sensitive data in logs

### Post-Deployment
- [ ] **Monitor health endpoint**: `/api/health` monitoring
- [ ] **Log monitoring**: Watch for authentication failures
- [ ] **Regular updates**: Keep dependencies updated
- [ ] **Key rotation schedule**: Plan periodic key rotation

## 🔍 Security Monitoring

### Health Monitoring
```bash
# Automated health check
curl -f http://localhost:3001/api/health || alert "Service down"
```

### Authentication Monitoring
```bash
# Test authentication endpoint
curl -X POST http://localhost:3001/api/contact-enrichment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: invalid_key" \
  -d '{"contactInfo": {"name": "Test"}}'
# Should return 401 error
```

### Log Monitoring Patterns
Look for these patterns in logs:
- Multiple authentication failures from same IP
- Unusual request patterns
- Service errors or exceptions
- Configuration loading issues

## 🚫 Security Limitations & Mitigations

### Current Limitations
1. **No rate limiting** - Consider implementing nginx/proxy rate limiting
2. **Single API key** - Consider implementing multiple key support
3. **No IP whitelisting** - Consider proxy-level IP restrictions
4. **No request logging** - Consider adding request audit logs

### Recommended Additional Security Layers

#### 1. Reverse Proxy with SSL/TLS
```nginx
# nginx.conf example
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_private_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. Rate Limiting
```nginx
# nginx rate limiting
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
    
    server {
        location /api/ {
            limit_req zone=api burst=5;
            proxy_pass http://localhost:3001;
        }
    }
}
```

#### 3. IP Whitelisting
```nginx
# nginx IP whitelisting
location /api/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    proxy_pass http://localhost:3001;
}
```

## 🔄 Security Update Process

### Regular Security Maintenance
1. **Update dependencies**: `npm audit && npm update`
2. **Rotate API keys**: Generate new keys periodically
3. **Review logs**: Check for security events
4. **Update containers**: Use latest base images
5. **Security scan**: Run security vulnerability scans

### Emergency Security Response
1. **Immediately rotate** compromised API keys
2. **Review access logs** for unauthorized usage
3. **Update configuration** with new security measures
4. **Notify stakeholders** of security events
5. **Document incident** for future prevention

## 📋 Security Testing

### Authentication Tests
```bash
# Run security test suite
export API_KEY="your_secure_api_key_here"
./test-api.sh

# Manual security tests
chmod +x security-tests.sh
./security-tests.sh
```

### Security Test Cases
1. **Valid API key** - Should succeed
2. **Invalid API key** - Should fail with 401
3. **Missing API key** - Should fail with 401
4. **Malformed headers** - Should fail gracefully
5. **SQL injection attempts** - Should be sanitized
6. **XSS attempts** - Should be sanitized

---

## 📞 Security Contact

For security-related issues:
1. **Check service health** first
2. **Review this documentation**
3. **Test with provided scripts**
4. **Contact system administrator**

**Remember**: Security is a shared responsibility. Always follow security best practices in your deployment environment.

---

**Contact Enrichment Service Security v1.0.0**  
Last Updated: 2025-05-29 
