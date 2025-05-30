import { ChatAnthropic } from '@langchain/anthropic';
import type { Embeddings } from '@langchain/core/embeddings';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import {
  getAnthropicApiKey,
  getDeepSeekApiKey,
  getGeminiApiKey,
  getGroqApiKey,
  getLMStudioApiUrl,
  getOllamaApiUrl,
  getOpenAIApiKey
} from './config';

interface ModelProvider {
  [key: string]: {
    model: BaseChatModel | Embeddings;
  };
}

interface ModelProviders {
  [key: string]: ModelProvider;
}

export const getAvailableChatModelProviders = async (): Promise<ModelProviders> => {
  const providers: ModelProviders = {};

  // OpenAI
  const openaiKey = getOpenAIApiKey();
  if (openaiKey) {
    providers.openai = {
      'gpt-3.5-turbo': {
        model: new ChatOpenAI({
          modelName: 'gpt-3.5-turbo',
          temperature: 0.3,
          openAIApiKey: openaiKey,
        }),
      },
      'gpt-4': {
        model: new ChatOpenAI({
          modelName: 'gpt-4',
          temperature: 0.3,
          openAIApiKey: openaiKey,
        }),
      },
      'gpt-4-turbo': {
        model: new ChatOpenAI({
          modelName: 'gpt-4-turbo',
          temperature: 0.3,
          openAIApiKey: openaiKey,
        }),
      },
      'gpt-4o': {
        model: new ChatOpenAI({
          modelName: 'gpt-4o',
          temperature: 0.3,
          openAIApiKey: openaiKey,
        }),
      },
    };
  }

  // GROQ
  const groqKey = getGroqApiKey();
  if (groqKey) {
    providers.groq = {
      'llama-3.1-70b-versatile': {
        model: new ChatGroq({
          modelName: 'llama-3.1-70b-versatile',
          temperature: 0.3,
          apiKey: groqKey,
        }),
      },
      'llama-3.1-8b-instant': {
        model: new ChatGroq({
          modelName: 'llama-3.1-8b-instant',
          temperature: 0.3,
          apiKey: groqKey,
        }),
      },
      'mixtral-8x7b-32768': {
        model: new ChatGroq({
          modelName: 'mixtral-8x7b-32768',
          temperature: 0.3,
          apiKey: groqKey,
        }),
      },
    };
  }

  // Anthropic
  const anthropicKey = getAnthropicApiKey();
  if (anthropicKey) {
    providers.anthropic = {
      'claude-sonnet-4-20250514': {
        model: new ChatAnthropic({
          modelName: 'claude-sonnet-4-20250514',
          temperature: 0.3,
          anthropicApiKey: anthropicKey,
        }),
      },
      'claude-3-haiku-20240307': {
        model: new ChatAnthropic({
          modelName: 'claude-3-haiku-20240307',
          temperature: 0.3,
          anthropicApiKey: anthropicKey,
        }),
      },
      'claude-3-opus-20240229': {
        model: new ChatAnthropic({
          modelName: 'claude-3-opus-20240229',
          temperature: 0.3,
          anthropicApiKey: anthropicKey,
        }),
      },
    };
  }

  // Google Gemini
  const geminiKey = getGeminiApiKey();
  if (geminiKey) {
    providers.gemini = {
      'gemini-pro': {
        model: new ChatGoogleGenerativeAI({
          modelName: 'gemini-pro',
          temperature: 0.3,
          apiKey: geminiKey,
        }),
      },
      'gemini-1.5-pro': {
        model: new ChatGoogleGenerativeAI({
          modelName: 'gemini-1.5-pro',
          temperature: 0.3,
          apiKey: geminiKey,
        }),
      },
    };
  }

  // OLLAMA
  const ollamaUrl = getOllamaApiUrl();
  if (ollamaUrl) {
    providers.ollama = {
      'llama3:8b': {
        model: new ChatOllama({
          model: 'llama3:8b',
          temperature: 0.3,
          baseUrl: ollamaUrl,
        }),
      },
      'llama3:70b': {
        model: new ChatOllama({
          model: 'llama3:70b',
          temperature: 0.3,
          baseUrl: ollamaUrl,
        }),
      },
      'mistral:7b': {
        model: new ChatOllama({
          model: 'mistral:7b',
          temperature: 0.3,
          baseUrl: ollamaUrl,
        }),
      },
    };
  }

  // DeepSeek (using OpenAI-compatible endpoint)
  const deepseekKey = getDeepSeekApiKey();
  if (deepseekKey) {
    providers.deepseek = {
      'deepseek-chat': {
        model: new ChatOpenAI({
          modelName: 'deepseek-chat',
          temperature: 0.3,
          openAIApiKey: deepseekKey,
          configuration: {
            baseURL: 'https://api.deepseek.com/v1',
          },
        }),
      },
    };
  }

  // LM Studio (using OpenAI-compatible endpoint)
  const lmStudioUrl = getLMStudioApiUrl();
  if (lmStudioUrl) {
    providers.lmstudio = {
      'local-model': {
        model: new ChatOpenAI({
          modelName: 'local-model',
          temperature: 0.3,
          openAIApiKey: 'lm-studio',
          configuration: {
            baseURL: `${lmStudioUrl}/v1`,
          },
        }),
      },
    };
  }

  return providers;
};

export const getAvailableEmbeddingModelProviders = async (): Promise<ModelProviders> => {
  const providers: ModelProviders = {};

  // OpenAI Embeddings
  const openaiKey = getOpenAIApiKey();
  if (openaiKey) {
    providers.openai = {
      'text-embedding-ada-002': {
        model: new OpenAIEmbeddings({
          modelName: 'text-embedding-ada-002',
          openAIApiKey: openaiKey,
        }),
      },
      'text-embedding-3-small': {
        model: new OpenAIEmbeddings({
          modelName: 'text-embedding-3-small',
          openAIApiKey: openaiKey,
        }),
      },
      'text-embedding-3-large': {
        model: new OpenAIEmbeddings({
          modelName: 'text-embedding-3-large',
          openAIApiKey: openaiKey,
        }),
      },
    };
  }

  // Google Gemini Embeddings
  const geminiKey = getGeminiApiKey();
  if (geminiKey) {
    providers.gemini = {
      'embedding-001': {
        model: new GoogleGenerativeAIEmbeddings({
          modelName: 'embedding-001',
          apiKey: geminiKey,
        }),
      },
    };
  }

  // OLLAMA Embeddings
  const ollamaUrl = getOllamaApiUrl();
  if (ollamaUrl) {
    // Note: OllamaEmbeddings import is currently not available in @langchain/ollama v0.0.3
    // Consider upgrading to a newer version or using alternative embedding providers
    console.warn('Ollama embeddings are not available in the current @langchain/ollama version');
  }

  return providers;
}; 
