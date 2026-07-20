export type AgentMode = 'auto' | 'hitl';

export type AgentRunStatus = 'idle' | 'running' | 'awaiting_human_review' | 'completed' | 'error';

export interface AgentRunResult {
  status: 'completed' | 'awaiting_human_review';
  threadId: string;
  finalOutput?: string;
  pendingDraft?: string;
  log: string[];
}
