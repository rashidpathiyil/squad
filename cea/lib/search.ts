import type { Embeddings } from '@langchain/core/embeddings';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { EventEmitter } from 'events';
import { getSearxngUrl } from './config';

interface SearchHandler {
  searchAndAnswer: (
    query: string,
    history: any[],
    llm: BaseChatModel,
    embeddings: Embeddings | undefined,
    optimizationMode: string,
    searchResults: any[],
    systemInstructions: string,
  ) => Promise<EventEmitter>;
}

interface SearxngResult {
  title: string;
  url: string;
  content: string;
  engine: string;
}

interface SearxngResponse {
  query: string;
  results: SearxngResult[];
}

const searchSearxng = async (query: string, maxResults: number = 5): Promise<SearxngResult[]> => {
  const searxngUrl = getSearxngUrl();
  
  if (!searxngUrl) {
    console.warn('SEARXNG URL not configured, skipping web search');
    return [];
  }

  try {
    const response = await axios.get(`${searxngUrl}/search`, {
      params: {
        q: query,
        format: 'json',
        engines: 'google,bing,duckduckgo',
        safesearch: 1,
        language: 'en',
      },
      timeout: 10000,
    });

    const data: SearxngResponse = response.data;
    return data.results?.slice(0, maxResults) || [];
  } catch (error) {
    console.error('Error searching with SEARXNG:', error);
    return [];
  }
};

const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContactEnrichmentBot/1.0)',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    
    // Extract text content
    let content = $('body').text() || '';
    
    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit content length
    
    return content;
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return '';
  }
};

const contactEnrichmentHandler: SearchHandler = {
  async searchAndAnswer(
    query: string,
    history: any[],
    llm: BaseChatModel,
    embeddings: Embeddings | undefined,
    optimizationMode: string,
    searchResults: any[],
    systemInstructions: string,
  ): Promise<EventEmitter> {
    const emitter = new EventEmitter();

    try {
      // Parse the contact info from query
      const contactInfo = JSON.parse(query);
      
      // Create comprehensive search queries
      const searchQueries = [];
      
      if (contactInfo.name && contactInfo.company) {
        searchQueries.push(`"${contactInfo.name}" "${contactInfo.company}"`);
      }
      if (contactInfo.email) {
        searchQueries.push(`"${contactInfo.email}"`);
      }
      if (contactInfo.name) {
        searchQueries.push(`"${contactInfo.name}" LinkedIn profile`);
        searchQueries.push(`"${contactInfo.name}" GitHub`);
      }
      if (contactInfo.company && contactInfo.title) {
        searchQueries.push(`"${contactInfo.company}" "${contactInfo.title}"`);
      }
      
      // Perform web searches
      const allSearchResults: SearxngResult[] = [];
      
      for (const searchQuery of searchQueries.slice(0, 3)) { // Limit to 3 searches for performance
        const results = await searchSearxng(searchQuery, 3);
        allSearchResults.push(...results);
      }
      
      // Extract additional content from promising URLs
      const enrichedResults = [];
      for (const result of allSearchResults.slice(0, 5)) { // Limit to 5 results
        if (result.url.includes('linkedin.com') || 
            result.url.includes('github.com') || 
            result.url.includes('crunchbase.com') ||
            result.url.includes('about.me')) {
          const content = await extractContentFromUrl(result.url);
          enrichedResults.push({
            ...result,
            fullContent: content
          });
        } else {
          enrichedResults.push(result);
        }
      }

      // Enhanced semantic search and ranking when embeddings are available
      let rankedResults = enrichedResults;
      if (embeddings) {
        try {
          // Create semantic query based on contact info
          const semanticQuery = [
            contactInfo.name,
            contactInfo.company,
            contactInfo.title,
            contactInfo.industry,
            contactInfo.location
          ].filter(Boolean).join(' ');

          if (semanticQuery.trim()) {
            // Get embeddings for the query
            const queryEmbedding = await embeddings.embedQuery(semanticQuery);
            
            // Get embeddings for each search result content
            const resultTexts = enrichedResults.map(result => 
              `${result.title} ${result.content} ${result.fullContent || ''}`.substring(0, 2000)
            );
            
            if (resultTexts.length > 0) {
              const resultEmbeddings = await embeddings.embedDocuments(resultTexts);
              
              // Calculate similarity scores using cosine similarity
              const similarities = resultEmbeddings.map(resultEmb => {
                const dotProduct = queryEmbedding.reduce((sum, a, i) => sum + a * resultEmb[i], 0);
                const normA = Math.sqrt(queryEmbedding.reduce((sum, a) => sum + a * a, 0));
                const normB = Math.sqrt(resultEmb.reduce((sum, b) => sum + b * b, 0));
                return dotProduct / (normA * normB);
              });
              
              // Rank results by semantic similarity
              const rankedIndices = similarities
                .map((sim, idx) => ({ similarity: sim, index: idx }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 8); // Keep top 8 most relevant results
              
              rankedResults = rankedIndices.map(({ index, similarity }) => ({
                ...enrichedResults[index],
                semanticScore: similarity
              }));
              
              console.log('Semantic search enabled - results ranked by relevance');
            }
          }
        } catch (embeddingError) {
          console.warn('Semantic search failed, falling back to standard ranking:', embeddingError);
          // Fall back to original results if semantic search fails
        }
      } else {
        console.log('Semantic search disabled - embeddings not available');
      }
      
      const enrichmentPrompt = `You are a professional contact enrichment AI. Your job is to enrich contact information with accurate, verified details based on web search results.

### Matching & Priority Rules:
- If **email or phone** is provided, treat it as the **primary identifier**.
  - **First**, try to match search results based on **email or phone**.
  - **Only if a match is found**, proceed to validate with **secondary identifiers** such as name, title, company, location, etc.
  - If the secondary identifiers (like name or title) do not align, reduce the confidence or exclude those conflicting fields.
- If **only name** is available, proceed with caution and clearly reflect uncertainty in the confidence scores.
- If no solid match can be made based on **email or phone**, **do not include** enriched data, or include it with **very low confidence**.

### Data Inclusion Rules:
- Only include fields where you have **reasonable confidence** based on actual search results.
- **Do not invent or guess** data. If a field is not found or not verifiable, exclude it.
- Include the **source URL** for each enriched data point.
- Confidence scores must range from **0 to 100** and reflect how sure you are that the information belongs to the same person.
${embeddings ? '- Search results have been semantically ranked by relevance - prioritize higher-ranked results.' : ''}

### Original Contact Info:
${JSON.stringify(contactInfo, null, 2)}

### Web Search Results${embeddings ? ' (Semantically Ranked)' : ''}:
${rankedResults.map((result, index) => `
${index + 1}. Title: ${result.title}
   URL: ${result.url}
   Content: ${result.content}
   ${result.fullContent ? `Full Content: ${result.fullContent.substring(0, 1000)}...` : ''}
   ${result.semanticScore ? `Relevance Score: ${(result.semanticScore * 100).toFixed(1)}%` : ''}
`).join('\n')}

### System Instructions:
${systemInstructions || 'Only return enriched data that confidently matches the provided input. Do not guess or fabricate information. If information is ambiguous or inconsistent, reflect that in the confidence scores and consider excluding the field entirely.'}

### IMPORTANT: Response Format Instructions
**YOU MUST RESPOND WITH ONLY THE JSON OBJECT. DO NOT INCLUDE ANY EXPLANATION, INTRODUCTION, OR CONCLUSION TEXT.**

**DO NOT START WITH PHRASES LIKE:**
- "Based on the provided information..."
- "Here is the enriched contact data..."
- "The following JSON object..."

**DO NOT END WITH EXPLANATIONS OR DESCRIPTIONS**

**RESPOND WITH VALID JSON ONLY - START WITH { AND END WITH }**

Return exactly this JSON structure with no additional text:

{
  "enrichedContact": {
    "name": "string",
    "email": "string", 
    "title": "string",
    "company": "string",
    "industry": "string",
    "location": "string",
    "bio": "string",
    "skills": ["string"],
    "socialProfiles": {
      "linkedin": "string",
      "github": "string", 
      "twitter": "string",
      "personalBlog": "string"
    },
    "phone": "string"
  },
  "confidenceScores": {
    "name": 95,
    "email": 100,
    "title": 85,
    "company": 90,
    "industry": 75,
    "location": 70,
    "bio": 60,
    "skills": 65,
    "socialProfiles": {
      "linkedin": 80,
      "github": 50,
      "twitter": 40,
      "personalBlog": 30
    },
    "phone": 20
  },
  "sources": {
    "name": "Original input or verified source URL",
    "company": "LinkedIn profile or company site URL",
    "title": "Company website or job listing URL",
    "industry": "Crunchbase or similar data source",
    "socialProfiles": "Web search results"
  }
}

### Final Requirements:
- **RESPOND WITH ONLY VALID JSON - NO EXPLANATORY TEXT**
- Only include fields where you have **reasonable confidence** based on the **actual search results**
- Confidence scores must range from **0 to 100**
- If search results do not contain relevant information for a field, **do not include it**
- Never guess or fabricate information
- Include **source URLs** for each enriched field
- Always prioritize **accuracy over completeness**`;

      // Simulate API call delay
      setTimeout(async () => {
        try {
          const response = await llm.invoke(enrichmentPrompt);
          const responseText = response.content as string;
          
          emitter.emit('data', JSON.stringify({
            type: 'response',
            data: responseText
          }));
          
          emitter.emit('data', JSON.stringify({
            type: 'sources',
            data: rankedResults.map(result => ({
              title: result.title,
              url: result.url,
              engine: result.engine,
              semanticScore: result.semanticScore
            }))
          }));
          
          emitter.emit('end');
        } catch (error) {
          emitter.emit('error', error);
        }
      }, 100);
      
    } catch (error) {
      setTimeout(() => {
        emitter.emit('error', error);
      }, 0);
    }

    return emitter;
  }
};

export const searchHandlers = {
  contactEnrichment: contactEnrichmentHandler
}; 
