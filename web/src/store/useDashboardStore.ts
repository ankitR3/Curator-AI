import { create } from 'zustand';
import { AgentMode, AgentRunStatus } from '../types';

export function cleanErrorMessage(rawMsg: string): string {
  if (!rawMsg) return 'An unexpected error occurred';
  if (rawMsg.includes('429') || rawMsg.toLowerCase().includes('rate limit')) {
    return 'Groq API rate limit reached (12,000 tokens/min limit). Please wait ~30 seconds before running again.';
  }
  try {
    const match = rawMsg.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch {}
  return rawMsg;
}

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
  setStatus: (status: AgentRunStatus) => void;
  setThreadId: (threadId: string | null) => void;
  setFinalOutput: (finalOutput: string | null) => void;
  setPendingDraft: (pendingDraft: string | null) => void;
  setLogs: (logs: string[]) => void;
  addLog: (log: string) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setFeedback: (feedback: string) => void;
  setActiveTab: (tab: string) => void;
  resetAgent: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  goal: '',
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
  setStatus: (status) => set({ status }),
  setThreadId: (threadId) => set({ threadId }),
  setFinalOutput: (finalOutput) => set({ finalOutput }),
  setPendingDraft: (pendingDraft) => set({ pendingDraft }),
  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
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
}));
