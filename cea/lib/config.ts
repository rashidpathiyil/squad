import * as TOML from '@iarna/toml';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Config {
  GENERAL: {
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  API_SECURITY: {
    API_KEY: string;
    REQUIRE_AUTH: boolean;
  };
  MODELS: {
    OPENAI: {
      API_KEY: string;
    };
    GROQ: {
      API_KEY: string;
    };
    ANTHROPIC: {
      API_KEY: string;
    };
    GEMINI: {
      API_KEY: string;
    };
    CUSTOM_OPENAI: {
      API_KEY: string;
      API_URL: string;
      MODEL_NAME: string;
    };
    OLLAMA: {
      API_URL: string;
    };
    DEEPSEEK: {
      API_KEY: string;
    };
    LM_STUDIO: {
      API_URL: string;
    };
  };
  API_ENDPOINTS: {
    SEARXNG: string;
  };
}

let config: Config | null = null;

const loadConfig = (): Config => {
  if (config) return config;
  
  try {
    // Try to read from parent directory first (where the main Perplexica config.toml is)
    const parentConfigPath = join(process.cwd(), '..', 'config.toml');
    let configContent: string;
    
    try {
      configContent = readFileSync(parentConfigPath, 'utf-8');
    } catch {
      // Fallback to current directory
      const localConfigPath = join(process.cwd(), 'config.toml');
      configContent = readFileSync(localConfigPath, 'utf-8');
    }
    
    config = TOML.parse(configContent) as unknown as Config;
    return config;
  } catch (error) {
    console.warn('Could not load config.toml, using environment variables as fallback');
    // Fallback to environment variables or defaults
    config = {
      GENERAL: {
        SIMILARITY_MEASURE: 'cosine',
        KEEP_ALIVE: '5m'
      },
      API_SECURITY: {
        API_KEY: process.env.API_KEY || 'development_key_please_change',
        REQUIRE_AUTH: process.env.REQUIRE_AUTH !== 'false'
      },
      MODELS: {
        OPENAI: {
          API_KEY: process.env.OPENAI_API_KEY || ''
        },
        GROQ: {
          API_KEY: process.env.GROQ_API_KEY || ''
        },
        ANTHROPIC: {
          API_KEY: process.env.ANTHROPIC_API_KEY || ''
        },
        GEMINI: {
          API_KEY: process.env.GEMINI_API_KEY || ''
        },
        CUSTOM_OPENAI: {
          API_KEY: process.env.CUSTOM_OPENAI_API_KEY || '',
          API_URL: process.env.CUSTOM_OPENAI_API_URL || 'https://api.openai.com/v1',
          MODEL_NAME: process.env.CUSTOM_OPENAI_MODEL_NAME || 'gpt-3.5-turbo'
        },
        OLLAMA: {
          API_URL: process.env.OLLAMA_API_URL || 'http://localhost:11434'
        },
        DEEPSEEK: {
          API_KEY: process.env.DEEPSEEK_API_KEY || ''
        },
        LM_STUDIO: {
          API_URL: process.env.LM_STUDIO_API_URL || 'http://localhost:1234'
        }
      },
      API_ENDPOINTS: {
        SEARXNG: process.env.SEARXNG_URL || ''
      }
    };
    return config;
  }
};

// Getter functions
export const getConfig = (): Config => loadConfig();

export const getCustomOpenaiApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.CUSTOM_OPENAI.API_KEY || useRuntimeConfig().customOpenaiApiKey || process.env.CUSTOM_OPENAI_API_KEY || '';
};

export const getCustomOpenaiApiUrl = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.CUSTOM_OPENAI.API_URL || useRuntimeConfig().customOpenaiApiUrl || process.env.CUSTOM_OPENAI_API_URL || 'https://api.openai.com/v1';
};

export const getCustomOpenaiModelName = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.CUSTOM_OPENAI.MODEL_NAME || useRuntimeConfig().customOpenaiModelName || process.env.CUSTOM_OPENAI_MODEL_NAME || 'gpt-3.5-turbo';
};

// Model provider API keys
export const getOpenAIApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.OPENAI.API_KEY || process.env.OPENAI_API_KEY || '';
};

export const getGroqApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.GROQ.API_KEY || process.env.GROQ_API_KEY || '';
};

export const getAnthropicApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.ANTHROPIC.API_KEY || process.env.ANTHROPIC_API_KEY || '';
};

export const getGeminiApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.GEMINI.API_KEY || process.env.GEMINI_API_KEY || '';
};

export const getDeepSeekApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.DEEPSEEK.API_KEY || process.env.DEEPSEEK_API_KEY || '';
};

export const getOllamaApiUrl = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.OLLAMA.API_URL || process.env.OLLAMA_API_URL || 'http://localhost:11434';
};

export const getLMStudioApiUrl = (): string => {
  const cfg = loadConfig();
  return cfg.MODELS.LM_STUDIO.API_URL || process.env.LM_STUDIO_API_URL || 'http://localhost:1234';
};

export const getSearxngUrl = (): string => {
  const cfg = loadConfig();
  return cfg.API_ENDPOINTS.SEARXNG || process.env.SEARXNG_URL || '';
};

export const getSimilarityMeasure = (): string => {
  const cfg = loadConfig();
  return cfg.GENERAL.SIMILARITY_MEASURE || 'cosine';
};

export const getKeepAlive = (): string => {
  const cfg = loadConfig();
  return cfg.GENERAL.KEEP_ALIVE || '5m';
};

// API Security functions
export const getApiKey = (): string => {
  const cfg = loadConfig();
  return cfg.API_SECURITY.API_KEY || process.env.API_KEY || 'development_key_please_change';
};

export const isAuthRequired = (): boolean => {
  const cfg = loadConfig();
  return cfg.API_SECURITY.REQUIRE_AUTH !== undefined ? cfg.API_SECURITY.REQUIRE_AUTH : (process.env.REQUIRE_AUTH !== 'false');
}; 
