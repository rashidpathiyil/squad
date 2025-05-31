import { createError, defineEventHandler, readBody } from 'h3';

interface UserInput {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
}

interface CEAEnrichmentRequest {
  contactInfo: {
    name?: string;
    email?: string;
    company?: string;
    title?: string;
  };
  optimizationMode?: 'speed' | 'balanced';
}

interface CEAEnrichmentResponse {
  enrichedContact: {
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
      personalBlog?: string;
    };
    phone?: string;
  };
  confidenceScores: {
    name?: number;
    email?: number;
    title?: number;
    company?: number;
    industry?: number;
    location?: number;
    bio?: number;
    skills?: number;
    socialProfiles?: {
      linkedin?: number;
    };
    phone?: number;
  };
  sources: Record<string, string>;
  enrichmentSummary: {
    fieldsEnriched: string[];
    fieldsNotFound: string[];
    overallConfidence: number;
  };
  originalContact?: {
    name: string;
    email: string;
  };
  semanticSearchUsed?: boolean;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UserInput>(event)
  
  if (!body.email || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and email are required',
    })
  }

  const runtimeConfig = useRuntimeConfig()
  
  // Get CEA API configuration from environment variables
  const ceaApiUrl = runtimeConfig.ceaApiUrl || 'http://localhost:3001'
  const ceaApiKey = runtimeConfig.ceaApiKey
  
  if (!ceaApiKey) {
    console.warn('CEA_API_KEY not configured, falling back to mock data')
    // Return mock data if CEA API is not configured
    return getMockEnrichmentData(body)
  }

  try {
    // Prepare request for CEA API
    const ceaRequest: CEAEnrichmentRequest = {
      contactInfo: {
        name: body.name,
        email: body.email,
        company: body.company,
        title: body.jobTitle,
      },
      optimizationMode: 'balanced'
    }

    console.log('Calling CEA API:', `${ceaApiUrl}/api/contact-enrichment`)

    // Call the CEA enrichment service
    const response = await fetch(`${ceaApiUrl}/api/contact-enrichment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ceaApiKey as string,
      },
      body: JSON.stringify(ceaRequest),
    })

    if (!response.ok) {
      console.error('CEA API error:', response.status, response.statusText)
      
      // Fall back to mock data if CEA API fails
      console.warn('Falling back to mock data due to CEA API error')
      return getMockEnrichmentData(body)
    }

    const ceaResult: CEAEnrichmentResponse = await response.json()
    console.log("🚀 ~ defineEventHandler ~ ceaResult:", ceaResult)
    
    // Transform CEA response to match demo UI format
    const transformedData = {
      // Basic contact information
      email: ceaResult.enrichedContact.email || body.email,
      name: ceaResult.enrichedContact.name || body.name,
      company: ceaResult.enrichedContact.company || body.company || 'Unknown',
      job_title: ceaResult.enrichedContact.title || body.jobTitle || 'Unknown',
      
      // Enhanced information from CEA
      location: ceaResult.enrichedContact.location || 'Not found',
      bio: ceaResult.enrichedContact.bio || 'Not available',
      skills: ceaResult.enrichedContact.skills || [],
      
      // Social profiles
      linkedin: ceaResult.enrichedContact.socialProfiles?.linkedin || 'Not found',
      github: ceaResult.enrichedContact.socialProfiles?.github || 'Not found',
      twitter: ceaResult.enrichedContact.socialProfiles?.twitter || 'Not found',
      personal_blog: ceaResult.enrichedContact.socialProfiles?.personalBlog || 'Not found',
      
      // Additional fields that might be present
      industry: ceaResult.enrichedContact.industry || 'Not found',
      phone: ceaResult.enrichedContact.phone || 'Not found',
      
      // CEA-specific confidence and metadata
      confidence_score: ceaResult.enrichmentSummary.overallConfidence,
      fields_enriched: ceaResult.enrichmentSummary.fieldsEnriched,
      fields_not_found: ceaResult.enrichmentSummary.fieldsNotFound,
      sources: ceaResult.sources,
      
      // Individual confidence scores for detailed display
      confidence_details: {
        name: ceaResult.confidenceScores.name || 0,
        email: ceaResult.confidenceScores.email || 0,
        title: ceaResult.confidenceScores.title || 0,
        company: ceaResult.confidenceScores.company || 0,
        location: ceaResult.confidenceScores.location || 0,
        bio: ceaResult.confidenceScores.bio || 0,
        skills: ceaResult.confidenceScores.skills || 0,
        linkedin: ceaResult.confidenceScores.socialProfiles?.linkedin || 0,
        phone: ceaResult.confidenceScores.phone || 0,
      },
      
      // Enrichment metadata
      semantic_search_used: ceaResult.semanticSearchUsed || false,
      original_contact: ceaResult.originalContact || { name: body.name, email: body.email },
      enrichment_timestamp: new Date().toISOString(),
      data_source: 'CEA API - Real Enrichment',
    }

    console.log('CEA enrichment successful:', transformedData)
    return transformedData

  } catch (error) {
    console.error('Error calling CEA API:', error)
    
    // Fall back to mock data if there's an error
    console.warn('Falling back to mock data due to error:', error)
    return getMockEnrichmentData(body)
  }
})

// Mock data function for fallback
function getMockEnrichmentData(body: UserInput) {
  console.log('Using mock enrichment data for:', body.email)
  
  return {
    email: body.email,
    name: body.name,
    company: body.company || 'Unknown',
    job_title: body.jobTitle || 'Unknown',
    magic_score: Math.floor(Math.random() * 100),
    user_status: ['Active', 'Power User', 'Early Adopter'][Math.floor(Math.random() * 3)],
    engagement_level: ['High', 'Medium', 'Very High'][Math.floor(Math.random() * 3)],
    surprise_factor: [
      'Early Technology Adopter',
      'Industry Influencer',
      'Growth Leader',
      'Innovation Champion'
    ][Math.floor(Math.random() * 4)],
    last_activity: new Date().toISOString(),
    predicted_interests: [
      'Artificial Intelligence',
      'Data Science',
      'Cloud Computing',
      'Digital Transformation',
      'Machine Learning'
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    trust_score: (Math.random() * 10).toFixed(1),
    industry_presence: ['Growing', 'Established', 'Leading'][Math.floor(Math.random() * 3)],
    growth_potential: Math.floor(Math.random() * 100),
    market_influence: ['Regional', 'National', 'Global'][Math.floor(Math.random() * 3)],
    data_source: 'Mock API (CEA not configured)',
    confidence_score: 75,
  }
} 
