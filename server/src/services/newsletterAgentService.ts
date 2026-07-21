import { v4 as uuidv4 } from 'uuid';
import { autoGraph, hitlGraph } from './agentGraphService';
import { AgentMode, AgentRunResult } from '../types';

export async function runNewsletterAgent(
  goal: string,
  mode: AgentMode = 'auto'
): Promise<AgentRunResult> {
  try {
    const threadId = uuidv4();
    const config = { configurable: { thread_id: threadId } };
    const targetGraph = mode === 'hitl' ? hitlGraph : autoGraph;

    const result = await targetGraph.invoke({ goal, mode }, config);

    const interrupted = (result as any).__interrupt__;
    if (interrupted && interrupted.length > 0) {
      return {
        status: 'awaiting_human_review',
        threadId,
        pendingDraft: interrupted[0].value.draftHtml,
        log: result.log,
      };
    }

    return {
      status: 'completed',
      threadId,
      finalOutput: result.finalOutput,
      log: result.log,
    };
  } catch (err) {
    console.error('runNewsletterAgent failed:', err);
    throw err;
  }
}

export async function approveNewsletter(
  threadId: string,
  approve: boolean,
  feedback?: string
): Promise<AgentRunResult> {
  try {
    const config = { configurable: { thread_id: threadId } };
    const { Command } = await import('@langchain/langgraph');
    const result = await hitlGraph.invoke(
      new Command({ resume: { approve, feedback } }) as any,
      config
    );

    const interrupted = (result as any).__interrupt__;
    if (interrupted && interrupted.length > 0) {
      return {
        status: 'awaiting_human_review',
        threadId,
        pendingDraft: interrupted[0].value.draftHtml,
        log: result.log,
      };
    }

    return {
      status: 'completed',
      threadId,
      finalOutput: result.finalOutput,
      log: result.log,
    };
  } catch (err) {
    console.error('approveNewsletter failed:', err);
    throw err;
  }
}