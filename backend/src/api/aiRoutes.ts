import { Router, Request, Response } from 'express';
import {
  executeServerAiRequest,
  getSafeProviderList,
  setServerProviderKey,
} from '../services/secureAiGateway.js';

export const aiRouter = Router();

/**
 * POST /api/ai/chat
 * Secure AI Chat & Multi-Model Routing
 */
aiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, language, modelId, taskType, operationalContext } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    const result = await executeServerAiRequest({
      prompt,
      language,
      modelId,
      taskType,
      operationalContext,
    });

    res.json(result);
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

/**
 * GET /api/ai/providers
 * Returns configured provider list with masked key previews (NO raw secrets!)
 */
aiRouter.get('/providers', (_req: Request, res: Response): void => {
  try {
    const providers = getSafeProviderList();
    res.json({ success: true, providers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/configure-key
 * Allows authorized administrators to set server-side API keys without client exposure
 */
aiRouter.post('/configure-key', (req: Request, res: Response): void => {
  try {
    const { providerId, apiKey, baseUrl } = req.body;
    if (!providerId || !apiKey) {
      res.status(400).json({ success: false, error: 'providerId and apiKey required' });
      return;
    }

    const ok = setServerProviderKey(providerId, apiKey, baseUrl);
    if (!ok) {
      res.status(404).json({ success: false, error: `Provider ${providerId} not found` });
      return;
    }

    res.json({
      success: true,
      message: `API Key for ${providerId} securely configured on server (Hidden from client).`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
