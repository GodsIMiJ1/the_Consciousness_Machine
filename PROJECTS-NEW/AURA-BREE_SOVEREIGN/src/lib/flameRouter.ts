/**
 * FlameRouter - Multi-Provider AI System for Sovereign AURA-BREE
 * Supports Ollama, LM Studio, Hugging Face, and OpenAI with priority-based failover
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  persona?: string;
  safetyLevel?: 'clinical' | 'standard' | 'permissive';
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  text: string;
  provider: string;
  elapsedMs: number;
  model?: string;
  tokensUsed?: number;
}

export interface EmbeddingRequest {
  texts: string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  provider: string;
  elapsedMs: number;
  model: string;
}

export interface ProviderConfig {
  priority: string[];
  timeoutMs: number;
  maxRetries: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetMs: number;
}

export interface ProviderStatus {
  name: string;
  available: boolean;
  lastError?: string;
  lastSuccess?: number;
  circuitOpen: boolean;
  failureCount: number;
}

// Circuit breaker state for each provider
const circuitBreakers = new Map<string, {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  nextRetry: number;
}>();

// Default configuration
const defaultConfig: ProviderConfig = {
  priority: (import.meta.env.VITE_FLAME_PROVIDER_PRIORITY ?? "ollama,lmstudio,hf,openai").split(","),
  timeoutMs: Number(import.meta.env.VITE_FLAME_TIMEOUT_MS ?? 30000),
  maxRetries: Number(import.meta.env.VITE_FLAME_MAX_RETRIES ?? 2),
  circuitBreakerThreshold: 3,
  circuitBreakerResetMs: 60000
};

// Provider endpoints
const endpoints = {
  ollama: import.meta.env.VITE_OLLAMA_BASE_URL || "http://localhost:11434",
  lmstudio: import.meta.env.VITE_LMSTUDIO_BASE_URL || "http://localhost:1234/v1",
  hf: import.meta.env.VITE_HF_API_BASE || "https://api-inference.huggingface.co",
  openai: import.meta.env.VITE_OPENAI_API_BASE || "https://api.openai.com/v1"
};

// API keys
const apiKeys = {
  hf: import.meta.env.VITE_HF_API_KEY,
  openai: import.meta.env.VITE_OPENAI_API_KEY
};

// Model defaults
const defaultModels = {
  ollama: {
    chat: "llama3.1:8b-instruct",
    embedding: "nomic-embed-text"
  },
  lmstudio: {
    chat: "qwen2.5:7b",
    embedding: "nomic-embed-text"
  },
  hf: {
    chat: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    embedding: "BAAI/bge-large-en-v1.5"
  },
  openai: {
    chat: "gpt-4o-mini",
    embedding: "text-embedding-3-large"
  }
};

/**
 * Check if a provider's circuit breaker is open
 */
function isCircuitOpen(provider: string): boolean {
  const breaker = circuitBreakers.get(provider);
  if (!breaker) return false;
  
  if (breaker.isOpen && Date.now() > breaker.nextRetry) {
    // Reset circuit breaker
    breaker.isOpen = false;
    breaker.failures = 0;
  }
  
  return breaker.isOpen;
}

/**
 * Record a failure for circuit breaker
 */
function recordFailure(provider: string): void {
  const breaker = circuitBreakers.get(provider) || {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
    nextRetry: 0
  };
  
  breaker.failures++;
  breaker.lastFailure = Date.now();
  
  if (breaker.failures >= defaultConfig.circuitBreakerThreshold) {
    breaker.isOpen = true;
    breaker.nextRetry = Date.now() + defaultConfig.circuitBreakerResetMs;
    console.warn(`[FlameRouter] Circuit breaker opened for ${provider}`);
  }
  
  circuitBreakers.set(provider, breaker);
}

/**
 * Record a success for circuit breaker
 */
function recordSuccess(provider: string): void {
  const breaker = circuitBreakers.get(provider);
  if (breaker) {
    breaker.failures = 0;
    breaker.isOpen = false;
  }
}

/**
 * Create timeout wrapper for fetch requests
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

/**
 * Ollama chat implementation
 */
async function ollamaChat(req: ChatRequest): Promise<string> {
  const model = defaultModels.ollama.chat;
  const response = await withTimeout(
    fetch(`${endpoints.ollama}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: req.messages,
        stream: false,
        options: {
          temperature: req.temperature ?? 0.8,
          num_predict: req.maxTokens ?? 500
        }
      })
    }),
    defaultConfig.timeoutMs
  );

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message?.content || data.response || "";
}

/**
 * LM Studio chat implementation
 */
async function lmStudioChat(req: ChatRequest): Promise<string> {
  const model = defaultModels.lmstudio.chat;
  const response = await withTimeout(
    fetch(`${endpoints.lmstudio}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.8,
        max_tokens: req.maxTokens ?? 500
      })
    }),
    defaultConfig.timeoutMs
  );

  if (!response.ok) {
    throw new Error(`LM Studio error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Hugging Face chat implementation
 */
async function hfChat(req: ChatRequest): Promise<string> {
  if (!apiKeys.hf) {
    throw new Error("Hugging Face API key not configured");
  }

  const model = defaultModels.hf.chat;
  const prompt = req.messages.map(m => `${m.role}: ${m.content}`).join("\n");
  
  const response = await withTimeout(
    fetch(`${endpoints.hf}/models/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKeys.hf}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: req.temperature ?? 0.8,
          max_new_tokens: req.maxTokens ?? 500,
          return_full_text: false
        }
      })
    }),
    defaultConfig.timeoutMs
  );

  if (!response.ok) {
    throw new Error(`Hugging Face error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data?.[0]?.generated_text || data?.generated_text || "";
}

/**
 * OpenAI chat implementation
 */
async function openAIChat(req: ChatRequest): Promise<string> {
  if (!apiKeys.openai) {
    throw new Error("OpenAI API key not configured");
  }

  const model = defaultModels.openai.chat;
  const response = await withTimeout(
    fetch(`${endpoints.openai}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKeys.openai}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.8,
        max_tokens: req.maxTokens ?? 500
      })
    }),
    defaultConfig.timeoutMs
  );

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Provider implementations map
const providers = {
  ollama: ollamaChat,
  lmstudio: lmStudioChat,
  hf: hfChat,
  openai: openAIChat
} as const;

/**
 * Main chat function with provider failover
 */
export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const start = Date.now();
  let lastError: Error | null = null;

  for (const providerName of defaultConfig.priority) {
    if (isCircuitOpen(providerName)) {
      console.warn(`[FlameRouter] Skipping ${providerName} - circuit breaker open`);
      continue;
    }

    const provider = providers[providerName as keyof typeof providers];
    if (!provider) {
      console.warn(`[FlameRouter] Unknown provider: ${providerName}`);
      continue;
    }

    try {
      console.log(`[FlameRouter] Trying ${providerName}...`);
      const text = await provider(req);
      recordSuccess(providerName);
      
      return {
        text,
        provider: providerName,
        elapsedMs: Date.now() - start,
        model: defaultModels[providerName as keyof typeof defaultModels]?.chat
      };
    } catch (error) {
      lastError = error as Error;
      recordFailure(providerName);
      console.warn(`[FlameRouter] ${providerName} failed:`, error.message);
      continue;
    }
  }

  throw new Error(`All providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Get status of all providers
 */
export function getProviderStatus(): ProviderStatus[] {
  return defaultConfig.priority.map(name => {
    const breaker = circuitBreakers.get(name);
    return {
      name,
      available: !isCircuitOpen(name),
      circuitOpen: breaker?.isOpen || false,
      failureCount: breaker?.failures || 0,
      lastError: breaker?.lastFailure ? new Date(breaker.lastFailure).toISOString() : undefined
    };
  });
}

/**
 * Check if any provider is configured and available
 */
export function isFlameRouterConfigured(): boolean {
  // Check if at least one provider has required configuration
  return !!(
    endpoints.ollama || 
    endpoints.lmstudio || 
    (endpoints.hf && apiKeys.hf) || 
    (endpoints.openai && apiKeys.openai)
  );
}
