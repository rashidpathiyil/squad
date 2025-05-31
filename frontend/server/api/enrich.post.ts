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
  confidenceScores: Record<string, number>;
  sources: Record<string, string>;
  enrichmentSummary: {
    fieldsEnriched: string[];
    fieldsNotFound: string[];
    overallConfidence: number;
  };
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
    
    // Transform CEA response to match demo UI format
    const transformedData = {
      email: ceaResult.enrichedContact.email || body.email,
      name: ceaResult.enrichedContact.name || body.name,
      company: ceaResult.enrichedContact.company || body.company || 'Unknown',
      job_title: ceaResult.enrichedContact.title || body.jobTitle || 'Unknown',
      industry: ceaResult.enrichedContact.industry || 'Unknown',
      location: ceaResult.enrichedContact.location || 'Unknown',
      bio: ceaResult.enrichedContact.bio || 'Professional profile',
      skills: ceaResult.enrichedContact.skills || [],
      social_profiles: {
        linkedin: ceaResult.enrichedContact.socialProfiles?.linkedin || '',
        github: ceaResult.enrichedContact.socialProfiles?.github || '',
        twitter: ceaResult.enrichedContact.socialProfiles?.twitter || '',
        personal_blog: ceaResult.enrichedContact.socialProfiles?.personalBlog || '',
      },
      phone: ceaResult.enrichedContact.phone || 'Not found',
      confidence_score: ceaResult.enrichmentSummary.overallConfidence,
      fields_enriched: ceaResult.enrichmentSummary.fieldsEnriched,
      fields_not_found: ceaResult.enrichmentSummary.fieldsNotFound,
      sources: ceaResult.sources,
      last_updated: new Date().toISOString(),
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
