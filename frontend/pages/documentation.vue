<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Light Navigation for Documentation -->
    <nav class="fixed w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Icon name="carbon:api" class="w-8 h-8 text-blue-600" />
          <NuxtLink to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">LeadUp
          </NuxtLink>
        </div>
        <div class="flex items-center space-x-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 transition-colors">Home</NuxtLink>
          <span class="text-blue-600 font-medium">Documentation</span>
          <NuxtLink to="/auth/register"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Get Started
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <div class="pt-40 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            API Documentation
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete integration guide for adding contact enrichment capabilities to your CRM system
          </p>
        </div>

        <!-- Navigation -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-semibold mb-4">Quick Navigation</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#overview" class="text-blue-600 hover:text-blue-800 font-medium">Overview</a>
            <a href="#authentication" class="text-blue-600 hover:text-blue-800 font-medium">Authentication</a>
            <a href="#endpoints" class="text-blue-600 hover:text-blue-800 font-medium">API Endpoints</a>
            <a href="#integration" class="text-blue-600 hover:text-blue-800 font-medium">Integration Guide</a>
          </div>
        </div>

        <!-- Overview Section -->
        <section id="overview" class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">🚀 Overview</h2>

          <div class="prose max-w-none">
            <p class="text-lg text-gray-700 mb-6">
              Our Contact Enrichment API transforms basic contact information into comprehensive professional profiles.
              Using AI-powered web search and data extraction, it provides detailed insights including job titles,
              company information, social profiles, and professional background.
            </p>

            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <div class="bg-blue-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold text-blue-900 mb-3">✨ Key Features</h3>
                <ul class="list-disc list-inside text-blue-800 space-y-2">
                  <li>AI-powered data enrichment</li>
                  <li>Comprehensive professional profiles</li>
                  <li>High confidence scoring</li>
                  <li>Multiple data sources</li>
                  <li>Real-time processing</li>
                  <li>Enterprise-grade security</li>
                </ul>
              </div>

              <div class="bg-green-50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold text-green-900 mb-3">📊 What You Get</h3>
                <ul class="list-disc list-inside text-green-800 space-y-2">
                  <li>Enhanced contact profiles</li>
                  <li>Job titles and company info</li>
                  <li>Social media profiles</li>
                  <li>Professional skills</li>
                  <li>Industry classification</li>
                  <li>Confidence scores</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Authentication Section -->
        <section id="authentication" class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">🔐 Authentication</h2>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  <strong>Important:</strong> All API endpoints require authentication using an API key.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <h3 class="text-xl font-semibold mb-3">Authentication Methods</h3>

              <div class="space-y-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">Method 1: X-API-Key Header</h4>
                  <div class="relative">
                    <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>curl -H "X-API-Key: your_api_key_here" \
       -H "Content-Type: application/json" \
       -X POST https://squad-4-qc-production.up.railway.app/api/contact-enrichment</code></pre>
                    <CopyButton
                      :text='`curl -H "X-API-Key: your_api_key_here" -H "Content-Type: application/json" -X POST https://squad-4-qc-production.up.railway.app/api/contact-enrichment`' />
                  </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-2">Method 2: Bearer Token</h4>
                  <div class="relative">
                    <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>curl -H "Authorization: Bearer your_api_key_here" \
       -H "Content-Type: application/json" \
       -X POST https://squad-4-qc-production.up.railway.app/api/contact-enrichment</code></pre>
                    <CopyButton
                      :text='`curl -H "Authorization: Bearer your_api_key_here" -H "Content-Type: application/json" -X POST https://squad-4-qc-production.up.railway.app/api/contact-enrichment`' />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xl font-semibold mb-3">Base URL</h3>
              <div class="space-y-3">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="relative">
                    <pre
                      class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>https://squad-4-qc-production.up.railway.app/</code></pre>
                    <CopyButton :text="'https://squad-4-qc-production.up.railway.app/'" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- API Endpoints Section -->
        <section id="endpoints" class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">📡 API Endpoints</h2>

          <!-- Health Check -->
          <div class="mb-8 border-b pb-6">
            <div class="flex items-center space-x-3 mb-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                GET
              </span>
              <code class="text-lg font-mono">/api/health</code>
            </div>
            <p class="text-gray-600 mb-4">Check service health status (no authentication required)</p>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">Example Response:</h4>
              <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>{
    "status": "healthy",
    "timestamp": "2024-05-30T12:00:00Z",
    "service": "contact-enrichment-service",
    "version": "1.0.0"
  }</code></pre>
            </div>
          </div>

          <!-- Contact Enrichment -->
          <div class="mb-8">
            <div class="flex items-center space-x-3 mb-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                POST
              </span>
              <code class="text-lg font-mono">/api/contact-enrichment</code>
            </div>
            <p class="text-gray-600 mb-4">Enrich contact information with comprehensive professional data</p>

            <div class="space-y-4">
              <div>
                <h4 class="font-semibold mb-2">Request Body:</h4>
                <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>{
    "contactInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "company": "Tech Corp",
      "title": "Software Engineer"
    },
    "optimizationMode": "balanced"
  }</code></pre>
              </div>

              <div>
                <h4 class="font-semibold mb-2">Response:</h4>
                <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>{
    "enrichedContact": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "industry": "Technology",
      "location": "San Francisco, CA",
      "bio": "Experienced software engineer with 8+ years...",
      "skills": ["JavaScript", "Python", "React", "Node.js"],
      "socialProfiles": {
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe"
      }
    },
    "confidenceScores": {
      "name": 95,
      "email": 100,
      "title": 88,
      "company": 92,
      "location": 85
    },
    "sources": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "company_website": "https://techcorp.com/team"
    },
    "enrichmentSummary": {
      "fieldsEnriched": ["title", "industry", "location", "bio", "skills"],
      "fieldsNotFound": ["phone"],
      "overallConfidence": 89
    }
  }</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- Integration Guide Section -->
        <section id="integration" class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">🔧 Integration Guide</h2>

          <div class="space-y-8">
            <!-- Step 1 -->
            <div class="border-l-4 border-blue-500 pl-6">
              <h3 class="text-xl font-semibold text-blue-900 mb-3">Step 1: Get Your API Key</h3>
              <p class="text-gray-700 mb-3">
                Contact our team to get your API key. Each organization receives a unique key for authentication.
              </p>
              <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-sm text-blue-800">
                  <strong>Security Note:</strong> Store your API key securely and never expose it in client-side code.
                </p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="border-l-4 border-green-500 pl-6">
              <h3 class="text-xl font-semibold text-green-900 mb-3">Step 2: Set Up Your Environment</h3>
              <p class="text-gray-700 mb-3">Configure your application with the API endpoint and authentication:</p>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold mb-2">Environment Variables</h4>
                  <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm"><code>ENRICHMENT_API_URL=https://squad-4-qc-production.up.railway.app/
      ENRICHMENT_API_KEY=your_api_key_here
      ENRICHMENT_TIMEOUT=30s</code></pre>
                </div>

                <div>
                  <h4 class="font-semibold mb-2">Configuration Example (Go)</h4>
                  <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>type Config struct {
      EnrichmentAPIURL string
      EnrichmentAPIKey string
      EnrichmentTimeout time.Duration
  }</code></pre>
                </div>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="border-l-4 border-purple-500 pl-6">
              <h3 class="text-xl font-semibold text-purple-900 mb-3">Step 3: Implement the Integration</h3>
              <p class="text-gray-700 mb-4">Here's how we integrated it in our backend (Go example):</p>

              <div class="bg-gray-50 p-4 rounded-lg">
                <pre class="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto"><code>func (s *ContactService) callEnrichmentAPI(contact OriginalContact) (*EnrichmentResponse, error) {
      reqBody := EnrichmentRequest{
          ContactInfo: contact,
      }

      jsonData, err := json.Marshal(reqBody)
      if err != nil {
          return nil, err
      }

      req, err := http.NewRequest("POST", s.config.EnrichmentAPIURL+"/api/contact-enrichment", bytes.NewBuffer(jsonData))
      if err != nil {
          return nil, err
      }

      req.Header.Set("Content-Type", "application/json")
      req.Header.Set("Authorization", "Bearer "+s.config.EnrichmentAPIKey)

      client := &http.Client{Timeout: s.config.EnrichmentTimeout}
      resp, err := client.Do(req)
      if err != nil {
          return nil, err
      }
      defer resp.Body.Close()

      if resp.StatusCode != http.StatusOK {
          return nil, fmt.Errorf("enrichment API returned status %d", resp.StatusCode)
      }

      var enrichmentResponse EnrichmentResponse
      err = json.NewDecoder(resp.Body).Decode(&enrichmentResponse)
      return &enrichmentResponse, nil
  }</code></pre>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="border-l-4 border-yellow-500 pl-6">
              <h3 class="text-xl font-semibold text-yellow-900 mb-3">Step 4: Handle Responses</h3>
              <p class="text-gray-700 mb-4">Process the enriched data and update your CRM records:</p>

              <div class="space-y-4">
                <div>
                  <h4 class="font-semibold mb-2">Data Models (Go)</h4>
                  <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>type EnrichmentResponse struct {
      EnrichedContact   Contact            `json:"enrichedContact"`
      ConfidenceScores  map[string]int     `json:"confidenceScores"`
      Sources          map[string]string   `json:"sources"`
      EnrichmentSummary EnrichmentSummary  `json:"enrichmentSummary"`
  }

  type EnrichmentSummary struct {
      FieldsEnriched    []string `json:"fieldsEnriched"`
      FieldsNotFound    []string `json:"fieldsNotFound"`
      OverallConfidence int      `json:"overallConfidence"`
  }</code></pre>
                </div>

                <div>
                  <h4 class="font-semibold mb-2">Error Handling</h4>
                  <pre class="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto"><code>// Always check confidence scores
  if enrichmentResponse.EnrichmentSummary.OverallConfidence &lt; 70 {
      log.Printf("Low confidence enrichment for contact %s", contact.Email)
  }

  // Handle partial enrichment
  if len(enrichmentResponse.EnrichmentSummary.FieldsNotFound) > 0 {
      log.Printf("Could not enrich fields: %v", enrichmentResponse.EnrichmentSummary.FieldsNotFound)
  }</code></pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Implementation Examples -->
        <section class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">💻 Implementation Examples</h2>

          <div class="space-y-8">
            <!-- JavaScript/Node.js -->
            <div>
              <h3 class="text-xl font-semibold mb-4">JavaScript/Node.js</h3>
              <pre class="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto"><code>const enrichContact = async (contactInfo) => {
    const response = await fetch('https://squad-4-qc-production.up.railway.app/api/contact-enrichment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ENRICHMENT_API_KEY}`
      },
      body: JSON.stringify({
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          company: contactInfo.company
        },
        optimizationMode: 'balanced'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };</code></pre>
            </div>

            <!-- Python -->
            <div>
              <h3 class="text-xl font-semibold mb-4">Python</h3>
              <pre class="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto"><code>import requests
  import os

  def enrich_contact(contact_info):
      url = "https://squad-4-qc-production.up.railway.app/api/contact-enrichment"
      
      headers = {
          "Content-Type": "application/json",
          "Authorization": f"Bearer {os.getenv('ENRICHMENT_API_KEY')}"
      }
      
      payload = {
          "contactInfo": {
              "name": contact_info.get("name"),
              "email": contact_info.get("email"),
              "company": contact_info.get("company")
          },
          "optimizationMode": "balanced"
      }
      
      response = requests.post(url, json=payload, headers=headers)
      response.raise_for_status()
      
      return response.json()</code></pre>
            </div>

            <!-- PHP -->
            <div>
              <h3 class="text-xl font-semibold mb-4">PHP</h3>
              <pre class="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto"><code>function enrichContact($contactInfo) {
      $url = 'https://squad-4-qc-production.up.railway.app/api/contact-enrichment';
      
      $headers = [
          'Content-Type: application/json',
          'Authorization: Bearer ' . $_ENV['ENRICHMENT_API_KEY']
      ];
      
      $payload = [
          'contactInfo' => [
              'name' => $contactInfo['name'],
              'email' => $contactInfo['email'],
              'company' => $contactInfo['company']
          ],
          'optimizationMode' => 'balanced'
      ];
      
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      
      $response = curl_exec($ch);
      curl_close($ch);
      
      return json_decode($response, true);
  }</code></pre>
            </div>
          </div>
        </section>

        <!-- Best Practices -->
        <section class="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">✅ Best Practices</h2>

          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-green-900 mb-4">✅ Do's</h3>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Always validate input data before sending requests</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Implement proper error handling and retries</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Check confidence scores before accepting data</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Store API keys securely using environment variables</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Implement request timeouts (recommended: 30-60 seconds)</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Log enrichment results for debugging and monitoring</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-red-900 mb-4">❌ Don'ts</h3>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">✗</span>
                  <span>Don't expose API keys in client-side code</span>
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">✗</span>
                  <span>Don't make concurrent requests without rate limiting</span>
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">✗</span>
                  <span>Don't ignore confidence scores or error responses</span>
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">✗</span>
                  <span>Don't send sensitive data unnecessarily</span>
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">✗</span>
                  <span>Don't bypass SSL certificate validation</span>
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">✗</span>
                  <span>Don't assume all fields will be enriched successfully</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Support Section -->
        <section class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">🎯 Support & Resources</h2>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-blue-50 p-6 rounded-lg text-center">
              <div class="text-3xl mb-3">📚</div>
              <h3 class="text-lg font-semibold text-blue-900 mb-2">Documentation</h3>
              <p class="text-blue-700 text-sm">
                Comprehensive guides and API references
              </p>
            </div>

            <div class="bg-green-50 p-6 rounded-lg text-center">
              <div class="text-3xl mb-3">💬</div>
              <h3 class="text-lg font-semibold text-green-900 mb-2">Developer Support</h3>
              <p class="text-green-700 text-sm">
                Get help from our technical team
              </p>
            </div>

            <div class="bg-purple-50 p-6 rounded-lg text-center">
              <div class="text-3xl mb-3">🔧</div>
              <h3 class="text-lg font-semibold text-purple-900 mb-2">Integration Help</h3>
              <p class="text-purple-700 text-sm">
                Custom integration assistance available
              </p>
            </div>
          </div>

          <div class="mt-8 text-center">
            <p class="text-gray-600 mb-4">
              Need help integrating our API? Our team is here to support you.
            </p>
            <div class="space-x-4">
              <a href="mailto:support@yourapi.com"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Contact Support
              </a>
              <NuxtLink to="/"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Back to Home
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CopyButton from '~/components/CopyButton.vue'

// Set page meta
definePageMeta({
  title: 'API Documentation - Contact Enrichment',
  description: 'Complete integration guide for our Contact Enrichment API',
  layout: false
})

// Smooth scrolling for navigation links
onMounted(() => {
  const links = document.querySelectorAll('a[href^="#"]')
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(link.getAttribute('href'))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
})
</script>

<style scoped>
/* Custom styles for code blocks */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Ensure proper spacing in prose */
.prose p {
  margin-bottom: 1rem;
}

/* Smooth hover transitions */
a {
  transition: all 0.2s ease-in-out;
}
</style>
