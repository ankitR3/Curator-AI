import { v4 as uuidv4 } from 'uuid';
import { autoGraph, hitlGraph } from './agentGraphService';
import { AgentMode, AgentRunResult } from '../types';

export async function* runNewsletterAgentStream(
  goal: string,
  mode: AgentMode = 'auto'
): AsyncGenerator<AgentRunResult> {
  const threadId = uuidv4();
  const config = { configurable: { thread_id: threadId } };
  const targetGraph = mode === 'hitl' ? hitlGraph : autoGraph;

  const eventStream = await targetGraph.stream(
    { goal, mode },
    { ...config, streamMode: 'values' }
  );

  let accumulatedLogs: string[] = [];

  for await (const chunk of eventStream) {
    if (chunk.log && Array.isArray(chunk.log)) {
      accumulatedLogs = chunk.log;
    }

    const interrupted = (chunk as any).__interrupt__;
    if (interrupted && interrupted.length > 0) {
      yield {
        status: 'awaiting_human_review',
        threadId,
        pendingDraft: interrupted[0].value.draftHtml || chunk.draftHtml || '',
        log: accumulatedLogs,
      };
      return;
    }

    if (chunk.finalOutput) {
      yield {
        status: 'completed',
        threadId,
        finalOutput: chunk.finalOutput,
        log: accumulatedLogs,
      };
      return;
    }

    yield {
      status: 'running',
      threadId,
      log: accumulatedLogs,
    };

    // Pacing delay so frontend step spinner transitions smoothly for every node
    await new Promise((r) => setTimeout(r, 400));
  }
}

export async function* approveNewsletterStream(
  threadId: string,
  approve: boolean,
  feedback?: string
): AsyncGenerator<AgentRunResult> {
  const config = { configurable: { thread_id: threadId } };
  const { Command } = await import('@langchain/langgraph');

  const eventStream = await hitlGraph.stream(
    new Command({ resume: { approve, feedback } }) as any,
    { ...config, streamMode: 'values' }
  );

  let accumulatedLogs: string[] = [];

  for await (const chunk of eventStream) {
    if (chunk.log && Array.isArray(chunk.log)) {
      accumulatedLogs = chunk.log;
    }

    const interrupted = (chunk as any).__interrupt__;
    if (interrupted && interrupted.length > 0) {
      yield {
        status: 'awaiting_human_review',
        threadId,
        pendingDraft: interrupted[0].value.draftHtml || (interrupted[0].value as any)?.pendingDraft || '',
        log: accumulatedLogs,
      };
      return;
    }

    if (chunk.finalOutput) {
      yield {
        status: 'completed',
        threadId,
        finalOutput: chunk.finalOutput,
        log: accumulatedLogs,
      };
      return;
    }

    yield {
      status: 'running',
      threadId,
      log: accumulatedLogs,
    };

    await new Promise((r) => setTimeout(r, 400));
  }
}

export async function runNewsletterAgent(
  goal: string,
  mode: AgentMode = 'auto'
): Promise<AgentRunResult> {
  let lastResult: AgentRunResult = {
    status: 'idle',
    threadId: '',
    log: [],
  };
  for await (const step of runNewsletterAgentStream(goal, mode)) {
    lastResult = step;
  }
  return lastResult;
}

export async function approveNewsletter(
  threadId: string,
  approve: boolean,
  feedback?: string
): Promise<AgentRunResult> {
  let lastResult: AgentRunResult = {
    status: 'idle',
    threadId: '',
    log: [],
  };
  for await (const step of approveNewsletterStream(threadId, approve, feedback)) {
    lastResult = step;
  }
  return lastResult;
}