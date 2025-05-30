import type { Embeddings } from '@langchain/core/embeddings';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import {
  getApiKey,
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
  isAuthRequired,
} from '../../lib/config';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '../../lib/providers';
import { searchHandlers } from '../../lib/search';

interface ContactInfo {
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
}

interface EnrichmentRequestBody {
  contactInfo: ContactInfo;
  chatModel?: {
    provider: string;
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

// Authentication helper functions
function validateApiKey(event: any): boolean {
  // Skip auth if not required
  if (!isAuthRequired()) {
    return true;
  }

  const headers = getHeaders(event);
  const providedKey = headers['x-api-key'] || headers['authorization']?.replace('Bearer ', '');
  
  if (!providedKey) {
    return false;
  }

  const validKey = getApiKey();
  return providedKey === validKey;
}

function createAuthError() {
  return createError({
    statusCode: 401,
    statusMessage: 'Unauthorized: Valid API key required. Provide it via X-API-Key header or Authorization: Bearer token'
  });
}

export default defineEventHandler(async (event) => {
  try {
    // Validate API key
    if (!validateApiKey(event)) {
      throw createAuthError();
    }

    const body: EnrichmentRequestBody = await readBody(event);

    if (!body.contactInfo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Contact information is required'
      });
    }

    // Validate that we have at least some identifying information
    const hasIdentifyingInfo = body.contactInfo.name || 
                              body.contactInfo.email || 
                              (body.contactInfo.company && body.contactInfo.title);

    if (!hasIdentifyingInfo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one of the following is required: name, email, or company+title combination'
      });
    }

    body.optimizationMode = body.optimizationMode || 'balanced';

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    const chatModelProvider =
      body.chatModel?.provider || Object.keys(chatModelProviders)[0];
    const chatModel =
      body.chatModel?.name ||
      Object.keys(chatModelProviders[chatModelProvider])[0];

    const embeddingModelProvider =
      body.embeddingModel?.provider || Object.keys(embeddingModelProviders)[0];
    const embeddingModel =
      body.embeddingModel?.name ||
      Object.keys(embeddingModelProviders[embeddingModelProvider])[0];

    let llm: BaseChatModel | undefined;
    let embeddings: Embeddings | undefined;

    if (body.chatModel?.provider === 'custom_openai') {
      llm = new ChatOpenAI({
        modelName: body.chatModel?.name || getCustomOpenaiModelName(),
        openAIApiKey:
          body.chatModel?.customOpenAIKey || getCustomOpenaiApiKey(),
        temperature: 0.3, // Lower temperature for more factual responses
        configuration: {
          baseURL:
            body.chatModel?.customOpenAIBaseURL || getCustomOpenaiApiUrl(),
        },
      }) as unknown as BaseChatModel;
    } else if (
      chatModelProviders[chatModelProvider] &&
      chatModelProviders[chatModelProvider][chatModel]
    ) {
      llm = chatModelProviders[chatModelProvider][chatModel]
        .model as unknown as BaseChatModel | undefined;
    }

    if (
      embeddingModelProviders[embeddingModelProvider] &&
      embeddingModelProviders[embeddingModelProvider][embeddingModel]
    ) {
      embeddings = embeddingModelProviders[embeddingModelProvider][
        embeddingModel
      ].model as Embeddings | undefined;
    }

    if (!llm || !embeddings) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid model selected'
      });
    }

    const searchHandler = searchHandlers['contactEnrichment'];

    if (!searchHandler) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Contact enrichment handler not available'
      });
    }

    // Convert contact info to query string
    const queryString = JSON.stringify(body.contactInfo);

    const emitter = await searchHandler.searchAndAnswer(
      queryString,
      [], // No chat history for contact enrichment
      llm,
      embeddings,
      body.optimizationMode,
      [],
      body.systemInstructions || '',
    );

    return new Promise<EnrichmentResponse>(
      (resolve, reject) => {
        let message = '';
        let sources: any[] = [];

        emitter.on('data', (data: string) => {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.type === 'response') {
              message += parsedData.data;
            } else if (parsedData.type === 'sources') {
              sources = parsedData.data;
            }
          } catch (error) {
            reject(createError({
              statusCode: 500,
              statusMessage: 'Error parsing enrichment data'
            }));
          }
        });

        emitter.on('end', () => {
          try {
            // Parse the JSON response from the AI
            const enrichmentResult = JSON.parse(message);
            
            // Calculate enrichment summary
            const originalFields = Object.keys(body.contactInfo).filter(
              key => body.contactInfo[key as keyof ContactInfo] !== undefined && 
                     body.contactInfo[key as keyof ContactInfo] !== null &&
                     body.contactInfo[key as keyof ContactInfo] !== ''
            );
            
            const enrichedFields = Object.keys(enrichmentResult.enrichedContact || {}).filter(
              key => enrichmentResult.enrichedContact[key] !== undefined && 
                     enrichmentResult.enrichedContact[key] !== null &&
                     enrichmentResult.enrichedContact[key] !== ''
            );
            
            const newFields = enrichedFields.filter(field => !originalFields.includes(field));
            const notFoundFields = ['name', 'title', 'company', 'industry', 'location', 'bio', 'skills', 'socialProfiles', 'email', 'phone']
              .filter(field => !enrichedFields.includes(field));

            // Calculate overall confidence
            const confidenceValues = Object.values(enrichmentResult.confidenceScores || {})
              .flat()
              .filter(val => typeof val === 'number') as number[];
            const overallConfidence = confidenceValues.length > 0 
              ? Math.round(confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length)
              : 0;

            const response: EnrichmentResponse = {
              enrichedContact: enrichmentResult.enrichedContact || body.contactInfo,
              confidenceScores: enrichmentResult.confidenceScores || {},
              sources: enrichmentResult.sources || {},
              originalContact: body.contactInfo,
              enrichmentSummary: {
                fieldsEnriched: newFields,
                fieldsNotFound: notFoundFields,
                overallConfidence,
              },
            };

            resolve(response);
          } catch (parseError) {
            // If JSON parsing fails, return the raw message
            resolve({
              enrichedContact: body.contactInfo,
              confidenceScores: {},
              sources: sources,
              originalContact: body.contactInfo,
              enrichmentSummary: {
                fieldsEnriched: [],
                fieldsNotFound: [],
                overallConfidence: 0,
              },
              rawResponse: message,
            } as any);
          }
        });

        emitter.on('error', (error: any) => {
          reject(createError({
            statusCode: 500,
            statusMessage: 'Contact enrichment error',
            data: error
          }));
        });
      },
    );
  } catch (err: any) {
    console.error(`Error in contact enrichment:`, {
      message: err.message,
      stack: err.stack,
      name: err.name,
      cause: err.cause
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: `Contact enrichment error: ${err.message}`,
      data: {
        error: err.message,
        type: err.name,
        details: err.cause || 'No additional details'
      }
    });
  }
}); 
