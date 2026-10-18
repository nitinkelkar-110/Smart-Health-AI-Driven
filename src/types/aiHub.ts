export type AIProviderName = 
  | 'OpenRouter' 
  | 'Groq' 
  | 'Gemini' 
  | 'HuggingFace' 
  | 'Cloudflare' 
  | 'Ollama' 
  | 'LocalRuleEngine';

export type FreeEligibilityType = 
  | 'PERMANENTLY_FREE_LOCAL' 
  | 'FREE_TIER_API' 
  | 'PROMOTIONAL' 
  | 'PAID';

export type ModelTaskType = 
  | 'chat' 
  | 'reasoning' 
  | 'healthcare' 
  | 'translation' 
  | 'coding' 
  | 'summarization' 
  | 'speech' 
  | 'vision';

export type ProviderStatusType = 'ONLINE' | 'AVAILABLE' | 'DEGRADED' | 'RATE_LIMITED' | 'OFFLINE' | 'UNCONFIGURED';

export interface AIModel {
  id: string;
  provider: AIProviderName;
  modelId: string;
  displayName: string;
  description: string;
  freeEligibility: FreeEligibilityType;
  pricingStatus: string; // e.g. "Free tier (0.00 / 1M tokens)", "Permanently Free (Local)"
  isFreeOnlyEligible: boolean;
  contextWindow: number; // in tokens, e.g. 131072
  modalities: ('text' | 'vision' | 'audio')[];
  supportedTasks: ModelTaskType[];
  supportedLanguages: string[]; // e.g. ["en", "hi", "mr", "es", "multilingual"]
  toolCalling: boolean;
  streaming: boolean;
  status: ProviderStatusType;
  rateLimitNote: string;
  estimatedLatencyMs: number;
  lastVerified: string;
  isDefault?: boolean;
}

export interface AIProviderConfig {
  id: AIProviderName;
  name: string;
  website: string;
  docsUrl: string;
  apiKey: string;
  baseUrl?: string;
  isEnabled: boolean;
  requiresApiKey: boolean;
  hasFreeTier: boolean;
  freeTierPolicy: string;
  status: ProviderStatusType;
  lastTested?: string;
  lastError?: string;
  discoveredModelsCount: number;
}

export interface RoutingTelemetry {
  id: string;
  timestamp: string;
  userPrompt: string;
  detectedLanguage: string;
  targetLanguage: string;
  taskType: ModelTaskType;
  selectedModel: string;
  providerUsed: AIProviderName;
  failoverAttempts: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
}

export interface GlobalLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  direction: 'ltr' | 'rtl';
  speechInputSupported: boolean;
  speechOutputSupported: boolean;
  aiChatQuality: 'Excellent' | 'Good' | 'Moderate' | 'Experimental';
  region: string;
  isCommon: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: AIProviderName;
  latencyMs?: number;
  groundedSources?: string[];
  isStreaming?: boolean;
  error?: string;
  liked?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  preferredLanguage: string;
  selectedModelId?: string;
}
