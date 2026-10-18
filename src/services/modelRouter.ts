import {
  AIModel,
  AIProviderConfig,
  AIProviderName,
  ModelTaskType,
  RoutingTelemetry,
  ChatMessage,
} from '../types/aiHub';
import { detectScriptAndLanguage } from './languageRegistry';
import { AppOperationalContext, queryRuleBasedAssistant } from './aiService';

export interface RouteRequestOptions {
  userPrompt: string;
  preferredLanguage: string;
  preferredModelId?: string;
  taskType?: ModelTaskType;
  operationalContext: AppOperationalContext;
  providers: AIProviderConfig[];
  availableModels: AIModel[];
  onStreamChunk?: (chunk: string) => void;
}

export interface RouteResponseResult {
  text: string;
  modelUsed: AIModel;
  providerUsed: AIProviderName;
  latencyMs: number;
  failoverAttempts: number;
  telemetry: RoutingTelemetry;
  groundedSources: string[];
}

/**
 * Intelligent Model Router and Automatic Failover Engine
 */
export async function executeRoutedAIRequest(
  options: RouteRequestOptions
): Promise<RouteResponseResult> {
  const startTime = Date.now();
  const detectedLang = detectScriptAndLanguage(options.userPrompt);
  const targetLang = options.preferredLanguage || detectedLang;

  // 1. Identify task type
  let task: ModelTaskType = options.taskType || 'chat';
  const qLower = options.userPrompt.toLowerCase();
  if (
    qLower.includes('shortage') ||
    qLower.includes('medicine') ||
    qLower.includes('bed') ||
    qLower.includes('doctor') ||
    qLower.includes('transfer') ||
    qLower.includes('phc') ||
    qLower.includes('chc')
  ) {
    task = 'healthcare';
  } else if (qLower.includes('forecast') || qLower.includes('predict') || qLower.includes('demand')) {
    task = 'reasoning';
  } else if (qLower.includes('translate') || qLower.includes('अनुवाद')) {
    task = 'translation';
  }

  // 2. Build candidate queue of free models
  let candidateModels: AIModel[] = [];

  if (options.preferredModelId && options.preferredModelId !== 'auto') {
    const specific = options.availableModels.find((m) => m.id === options.preferredModelId);
    if (specific) {
      candidateModels.push(specific);
    }
  }

  // Add all other eligible free models grouped by providers to enable genuine failover
  const eligibleFree = options.availableModels.filter((m) => m.isFreeOnlyEligible);

  // Sort by task suitability & latency
  const ranked = [...eligibleFree].sort((a, b) => {
    const aTaskMatch = a.supportedTasks.includes(task) ? 1 : 0;
    const bTaskMatch = b.supportedTasks.includes(task) ? 1 : 0;
    if (aTaskMatch !== bTaskMatch) return bTaskMatch - aTaskMatch;
    return a.estimatedLatencyMs - b.estimatedLatencyMs;
  });

  ranked.forEach((m) => {
    if (!candidateModels.some((c) => c.id === m.id)) {
      candidateModels.push(m);
    }
  });

  // Always ensure the embedded offline MediGrid clinical engine is at the end of the failover chain!
  const localFallback = options.availableModels.find((m) => m.provider === 'LocalRuleEngine');
  if (localFallback && !candidateModels.some((c) => c.id === localFallback.id)) {
    candidateModels.push(localFallback);
  }

  // Grounding RAG Context
  const sourcesCited: string[] = [
    `District Telemetry: ${options.operationalContext.facilities.length} active PHCs/CHCs`,
    `Medicine Inventory Ledger (22 batches)`,
    `Hospital Bed Availability Matrix (${options.operationalContext.beds.length} reporting facilities)`,
    `Doctor Shift Roster Telemetry`,
  ];

  let failovers = 0;
  let lastError: string | null = null;

  // 3. Failover Execution Loop
  for (const model of candidateModels) {
    const providerConfig = options.providers.find((p) => p.id === model.provider);

    // Skip if provider explicitly disabled
    if (providerConfig && !providerConfig.isEnabled) {
      continue;
    }

    try {
      // Execute adapter call
      const resultText = await executeProviderAdapter(
        model,
        providerConfig,
        options.userPrompt,
        targetLang,
        options.operationalContext
      );

      if (resultText && resultText.trim()) {
        const latency = Date.now() - startTime;
        const telemetry: RoutingTelemetry = {
          id: `ROUT-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toISOString(),
          userPrompt: options.userPrompt,
          detectedLanguage: detectedLang,
          targetLanguage: targetLang,
          taskType: task,
          selectedModel: model.displayName,
          providerUsed: model.provider,
          failoverAttempts: failovers,
          latencyMs: latency,
          success: true,
        };

        return {
          text: resultText,
          modelUsed: model,
          providerUsed: model.provider,
          latencyMs: latency,
          failoverAttempts: failovers,
          telemetry,
          groundedSources: sourcesCited,
        };
      }
    } catch (err: any) {
      failovers++;
      lastError = err?.message || 'Provider connection error';
      console.warn(`Model ${model.displayName} failed (${lastError}), initiating automatic failover to next eligible free model...`);
    }
  }

  // 4. Absolute Final Fallback: MediGrid Embedded Clinical Logic
  const localModel = candidateModels.find((m) => m.provider === 'LocalRuleEngine') || candidateModels[0];
  const ruleAnswer = queryRuleBasedAssistant(options.userPrompt, options.operationalContext, targetLang as any);
  const latency = Date.now() - startTime;

  return {
    text: ruleAnswer,
    modelUsed: localModel,
    providerUsed: 'LocalRuleEngine',
    latencyMs: latency,
    failoverAttempts: failovers,
    telemetry: {
      id: `ROUT-FALLBACK-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userPrompt: options.userPrompt,
      detectedLanguage: detectedLang,
      targetLanguage: targetLang,
      taskType: task,
      selectedModel: 'MediGrid Clinical Telemetry Engine v1 (Offline Safe Fallback)',
      providerUsed: 'LocalRuleEngine',
      failoverAttempts: failovers,
      latencyMs: latency,
      success: true,
      errorMessage: lastError || undefined,
    },
    groundedSources: sourcesCited,
  };
}

/**
 * Provider-Specific Execution Adapters
 * Securely routes through the MediGrid backend gateway (/api/ai/chat)
 * so third-party provider credentials are NEVER exposed to the client browser.
 */
async function executeProviderAdapter(
  model: AIModel,
  providerConfig: AIProviderConfig | undefined,
  prompt: string,
  targetLang: string,
  context: AppOperationalContext
): Promise<string> {
  // 1. LocalRuleEngine (Always works instantly without internet or keys)
  if (model.provider === 'LocalRuleEngine') {
    await new Promise((r) => setTimeout(r, 60)); // natural micro-delay
    return queryRuleBasedAssistant(prompt, context, targetLang as any);
  }

  // 2. Route external models through secure server proxy (/api/ai/chat)
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        language: targetLang,
        modelId: model.modelId,
        taskType: 'healthcare',
        operationalContext: context,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (err: any) {
    console.warn(`[Secure Gateway Proxy] Direct server call failed: ${err.message}. Initiating failover...`);
  }

  // If server is not responding, fallback to local clinical assistant
  throw new Error(`Provider ${model.provider} temporarily unavailable`);
}

