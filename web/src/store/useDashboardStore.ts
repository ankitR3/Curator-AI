import { create } from 'zustand';
import { AgentMode, AgentRunStatus } from '../types';
import { RUN_AGENT_URL, getApproveAgentUrl } from '../../routes/api-routes';

interface DashboardState {
  goal: string;
  mode: AgentMode;
  status: AgentRunStatus;
  threadId: string | null;
  finalOutput: string | null;
  pendingDraft: string | null;
  logs: string[];
  errorMessage: string | null;
  feedback: string;
  activeTab: string;

  setGoal: (goal: string) => void;
  setMode: (mode: AgentMode) => void;
  setFeedback: (feedback: string) => void;
  setActiveTab: (tab: string) => void;

  runAgent: () => Promise<void>;
  approveAgent: (approve: boolean) => Promise<void>;
  resetAgent: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  goal: 'Create a weekly newsletter on latest AI agent news and send it to our subscribers.',
  mode: 'auto',
  status: 'idle',
  threadId: null,
  finalOutput: null,
  pendingDraft: null,
  logs: [],
  errorMessage: null,
  feedback: '',
  activeTab: 'dashboard',

  setGoal: (goal) => set({ goal }),
  setMode: (mode) => set({ mode }),
  setFeedback: (feedback) => set({ feedback }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  resetAgent: () =>
    set({
      status: 'idle',
      threadId: null,
      finalOutput: null,
      pendingDraft: null,
      logs: [],
      errorMessage: null,
      feedback: '',
    }),

  runAgent: async () => {
    const { goal, mode } = get();
    if (!goal.trim()) return;

    set({
      status: 'running',
      errorMessage: null,
      finalOutput: null,
      pendingDraft: null,
      logs: ['Initiating Newsletter Agent pipeline...'],
    });

    try {
      const res = await fetch(RUN_AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mode }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      if (data.status === 'awaiting_human_review') {
        set({
          status: 'awaiting_human_review',
          threadId: data.threadId,
          pendingDraft: data.pendingDraft || null,
          logs: data.log || [],
        });
      } else {
        set({
          status: 'completed',
          threadId: data.threadId,
          finalOutput: data.finalOutput || null,
          logs: data.log || [],
        });
      }
    } catch (err: any) {
      console.error('runAgent error:', err);
      set({
        status: 'error',
        errorMessage: err.message || 'Failed to communicate with backend server',
        logs: [...get().logs, `Error: ${err.message || 'Agent run failed'}`],
      });
    }
  },

  approveAgent: async (approve: boolean) => {
    const { threadId, feedback } = get();
    if (!threadId) return;

    set({
      status: 'running',
      errorMessage: null,
      logs: [...get().logs, approve ? 'Human approved draft. Finalizing...' : `Human requested revision: "${feedback}"`],
    });

    try {
      const res = await fetch(getApproveAgentUrl(threadId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve, feedback }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Approval failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.status === 'awaiting_human_review') {
        set({
          status: 'awaiting_human_review',
          threadId: data.threadId,
          pendingDraft: data.pendingDraft || null,
          logs: data.log || [],
          feedback: '',
        });
      } else {
        set({
          status: 'completed',
          threadId: data.threadId,
          finalOutput: data.finalOutput || null,
          logs: data.log || [],
          feedback: '',
        });
      }
    } catch (err: any) {
      console.error('approveAgent error:', err);
      set({
        status: 'error',
        errorMessage: err.message || 'Failed to submit approval',
        logs: [...get().logs, `Error submitting approval: ${err.message}`],
      });
    }
  },
}));
