export interface Article {
  title: string;
  url: string;
  snippet: string;
}

export interface Summary {
  title: string;
  url: string;
  summary: string;
}

export type AgentMode = 'auto' | 'hitl';

export type AgentRunStatus = 'idle' | 'running' | 'completed' | 'awaiting_human_review' | 'error';

export interface AgentRunResult {
  status: AgentRunStatus;
  threadId: string;
  finalOutput?: string;
  pendingDraft?: string;
  log: string[];
}

export interface RunAgentRequestBody {
  goal: string;
  mode?: AgentMode;
}

export interface ApproveAgentRequestBody {
  approve: boolean;
  feedback?: string;
}