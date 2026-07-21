import { Request, Response } from 'express';
import { approveNewsletter } from '../../services/newsletterAgentService';
import { ApproveAgentRequestBody } from '../../types';

function parseCleanErrorMessage(err: any): string {
  const rawMsg = err?.message || err?.toString() || 'Approval step failed';
  if (rawMsg.includes('429') || rawMsg.includes('Rate limit')) {
    return 'Groq API rate limit reached (12,000 tokens/min limit). Please wait ~30 seconds before trying again.';
  }
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch { }
  return rawMsg;
}

export async function approveAgentController(
  req: Request<{ threadId: string }, {}, ApproveAgentRequestBody>,
  res: Response
) {
  try {
    const { threadId } = req.params;
    const { approve, feedback } = req.body;
    const result = await approveNewsletter(threadId, approve, feedback);
    res.json(result);
  } catch (err: any) {
    console.error('approveAgentController failed:', err);
    const cleanError = parseCleanErrorMessage(err);
    res.status(500).json({ error: cleanError });
  }
}