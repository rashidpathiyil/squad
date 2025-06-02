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
  semanticSearchUsed?: boolean;
  rawResponse?: string;
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

    // Check if we have any providers available
    if (!chatModelProviders || Object.keys(chatModelProviders).length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No chat model providers available. Please configure at least one API key (OPENAI_API_KEY, GROQ_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, or DEEPSEEK_API_KEY)'
      });
    }

    // Embedding models are now optional - warn if not available but don't block
    const hasEmbeddingProviders = embeddingModelProviders && Object.keys(embeddingModelProviders).length > 0;
    if (!hasEmbeddingProviders) {
      console.warn('No embedding model providers available. Semantic search will be disabled. Consider configuring OPENAI_API_KEY or GEMINI_API_KEY for enhanced search quality.');
    }

    const chatModelProvider =
      body.chatModel?.provider || (() => {
        // Prioritize providers based on what's actually available
        const availableProviders = Object.keys(chatModelProviders);
        
        // Check if we have Anthropic available (since user has the API key)
        if (availableProviders.includes('anthropic')) {
          return 'anthropic';
        }
        
        // Check if we have Ollama available (local, no API key needed)
        if (availableProviders.includes('ollama')) {
          return 'ollama';
        }
        
        // Fallback to first available provider
        return availableProviders[0];
      })();
    const chatModel =
      body.chatModel?.name ||
      Object.keys(chatModelProviders[chatModelProvider] || {})[0];

    const embeddingModelProvider = hasEmbeddingProviders
      ? (body.embeddingModel?.provider || (() => {
          // Prioritize providers based on what's actually available
          const availableProviders = Object.keys(embeddingModelProviders);
          
          // Check if we have Ollama available (local, no API key needed)
          if (availableProviders.includes('ollama')) {
            return 'ollama';
          }
          
          // Fallback to first available provider
          return availableProviders[0];
        })())
      : null;
    const embeddingModel = hasEmbeddingProviders && embeddingModelProvider
      ? (body.embeddingModel?.name || Object.keys(embeddingModelProviders[embeddingModelProvider] || {})[0])
      : null;

    // Additional validation
    if (!chatModelProviders[chatModelProvider] || !chatModel) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid chat model provider: ${chatModelProvider} or model: ${chatModel}`
      });
    }

    if (hasEmbeddingProviders && embeddingModelProvider && (!embeddingModelProviders[embeddingModelProvider] || !embeddingModel)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid embedding model provider: ${embeddingModelProvider} or model: ${embeddingModel}`
      });
    }

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
      hasEmbeddingProviders &&
      embeddingModelProvider &&
      embeddingModel &&
      embeddingModelProviders[embeddingModelProvider] &&
      embeddingModelProviders[embeddingModelProvider][embeddingModel]
    ) {
      embeddings = embeddingModelProviders[embeddingModelProvider][
        embeddingModel
      ].model as Embeddings | undefined;
    }

    if (!llm) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid chat model selected'
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
            // For some LLMs (like Anthropic), the response may contain explanation text
            // before and after the JSON. We need to extract just the JSON part.
            let enrichmentResult;
            
            try {
              // First, try to parse the message as-is (works for most LLMs)
              enrichmentResult = JSON.parse(message);
            } catch (firstParseError) {
              // If that fails, try to extract JSON from the response
              // Look for JSON block that starts with { and includes enrichedContact
              const lines = message.split('\n');
              let jsonStart = -1;
              let jsonEnd = -1;
              let braceCount = 0;
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('{') && jsonStart === -1) {
                  jsonStart = i;
                  braceCount = 1;
                } else if (jsonStart !== -1) {
                  for (const char of line) {
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                    if (braceCount === 0) {
                      jsonEnd = i;
                      break;
                    }
                  }
                  if (braceCount === 0) break;
                }
              }
              
              if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
                const jsonText = jsonLines.join('\n');
                console.log('Extracted JSON text:', jsonText.substring(0, 500));
                enrichmentResult = JSON.parse(jsonText);
                console.log('Parsed enrichmentResult keys:', Object.keys(enrichmentResult));
              } else {
                // Fallback: try simple regex extraction
                const jsonMatch = message.match(/\{[\s\S]*?\n\}/);
                if (jsonMatch) {
                  console.log('Regex extracted JSON:', jsonMatch[0].substring(0, 500));
                  enrichmentResult = JSON.parse(jsonMatch[0]);
                } else {
                  throw firstParseError;
                }
              }
            }
            
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

            // Check if semantic search was used
            const semanticSearchUsed = embeddings !== undefined && sources.some(source => source.semanticScore !== undefined);

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
              semanticSearchUsed,
              rawResponse: enrichmentResult.rawResponse,
            };

            resolve(response);
          } catch (parseError) {
            // If JSON parsing fails, return the raw message
            const semanticSearchUsed = embeddings !== undefined && sources.some(source => source.semanticScore !== undefined);
            
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
              semanticSearchUsed,
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
