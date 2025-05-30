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
    embeddings: Embeddings,
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
    embeddings: Embeddings,
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
      
      const enrichmentPrompt = `
You are a professional contact enrichment AI. Given the following contact information and web search results, provide enriched data in JSON format.

Original Contact Info:
${JSON.stringify(contactInfo, null, 2)}

Web Search Results:
${enrichedResults.map((result, index) => `
${index + 1}. Title: ${result.title}
   URL: ${result.url}
   Content: ${result.content}
   ${result.fullContent ? `Full Content: ${result.fullContent.substring(0, 1000)}...` : ''}
`).join('\n')}

System Instructions:
${systemInstructions || 'Provide accurate and professional contact enrichment based on the search results.'}

Please return a JSON object with the following structure:
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
    "name": "Original input",
    "company": "LinkedIn profile",
    "title": "Company website",
    "industry": "Crunchbase data",
    "socialProfiles": "Web search results"
  }
}

Only include fields where you have reasonable confidence based on the search results. Confidence scores should be between 0-100.
Base the enrichment on the actual search results provided. If search results don't contain relevant information, don't invent data.
Include the source URLs where you found each piece of information.
`;

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
            data: enrichedResults.map(result => ({
              title: result.title,
              url: result.url,
              engine: result.engine
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
