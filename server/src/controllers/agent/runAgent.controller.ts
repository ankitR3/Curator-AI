import { Request, Response } from 'express';
import { runNewsletterAgent } from '../../services/newsletterAgentService';
import { RunAgentRequestBody } from '../../types';

function parseCleanErrorMessage(err: any): string {
  const rawMsg = err?.message || err?.toString() || 'Agent run failed';
  if (rawMsg.includes('429') || rawMsg.includes('Rate limit')) {
    return 'Groq API rate limit reached (12,000 tokens/min limit). Please wait ~30 seconds before running again.';
  }
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch {}
  return rawMsg;
}

export async function runAgentController(
  req: Request<{}, {}, RunAgentRequestBody>,
  res: Response
) {
  try {
    const { goal, mode } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'goal is required' });
    }
    const result = await runNewsletterAgent(goal, mode || 'auto');
    res.json(result);
  } catch (err: any) {
    console.error('runAgentController failed:', err);
    const cleanError = parseCleanErrorMessage(err);
    res.status(500).json({ error: cleanError });
  }
}