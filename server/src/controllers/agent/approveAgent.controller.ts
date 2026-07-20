import { Request, Response } from 'express';
import { approveNewsletter } from '../../services/newsletterAgentService';
import { ApproveAgentRequestBody } from '../../types';

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
    res.status(500).json({ error: err.message || 'Approval step failed' });
  }
}