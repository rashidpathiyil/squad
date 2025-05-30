export default defineEventHandler((event) => {
  return {
    name: 'Contact Enrichment Service',
    version: '1.0.0',
    description: 'Standalone contact enrichment service built with Nitro',
    security: {
      authentication: 'API Key required',
      headers: {
        'X-API-Key': 'Your API key',
        'or': 'Authorization: Bearer YOUR_API_KEY'
      },
      note: 'All endpoints require authentication except /api/health'
    },
    endpoints: {
      'GET /': 'This documentation',
      'GET /api/health': 'Health check endpoint (no auth required)',
      'POST /api/contact-enrichment': 'Contact enrichment endpoint (auth required)'
    },
    usage: {
      'POST /api/contact-enrichment': {
        description: 'Enrich contact information using AI',
        authentication: 'Required: X-API-Key header or Authorization: Bearer token',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your_api_key_here'
        },
        body: {
          contactInfo: {
            name: 'string (optional)',
            email: 'string (optional)',
            title: 'string (optional)',
            company: 'string (optional)',
            industry: 'string (optional)',
            location: 'string (optional)',
            bio: 'string (optional)',
            skills: 'string[] (optional)',
            socialProfiles: {
              linkedin: 'string (optional)',
              github: 'string (optional)',
              twitter: 'string (optional)',
              personalBlog: 'string (optional)'
            },
            phone: 'string (optional)'
          },
          chatModel: {
            provider: 'string (optional, default: openai)',
            name: 'string (optional, default: gpt-3.5-turbo)',
            customOpenAIKey: 'string (optional)',
            customOpenAIBaseURL: 'string (optional)'
          },
          embeddingModel: {
            provider: 'string (optional, default: openai)',
            name: 'string (optional, default: text-embedding-ada-002)'
          },
          optimizationMode: 'speed | balanced (optional, default: balanced)',
          systemInstructions: 'string (optional)'
        },
        example: {
          contactInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            company: 'Example Corp'
          }
        }
      }
    },
    environment: {
      API_KEY: 'Your API key for authentication',
      REQUIRE_AUTH: 'Enable/disable authentication (default: true)',
      CUSTOM_OPENAI_API_KEY: 'Your OpenAI API key',
      CUSTOM_OPENAI_API_URL: 'OpenAI API URL (optional)',
      CUSTOM_OPENAI_MODEL_NAME: 'OpenAI model name (optional)',
      PORT: 'Server port (optional, default: 3000)'
    },
    examples: {
      'curl with API key': `curl -X POST http://localhost:3001/api/contact-enrichment \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{"contactInfo": {"name": "John Doe", "email": "john@example.com"}}'`,
      'curl with Bearer token': `curl -X POST http://localhost:3001/api/contact-enrichment \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -d '{"contactInfo": {"name": "John Doe", "email": "john@example.com"}}'`
    }
  };
}); 
