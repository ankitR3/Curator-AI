import { Request, Response } from 'express';
import { runNewsletterAgent } from '../../services/newsletterAgentService';
import { RunAgentRequestBody } from '../../types';

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
    res.status(500).json({ error: err.message || 'Agent run failed' });
  }
}