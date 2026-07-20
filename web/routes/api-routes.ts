const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const API_URL = `${BACKEND_URL}/api/v1`;

export const RUN_AGENT_URL = `${API_URL}/run`;

export const getApproveAgentUrl = (threadId: string) => `${API_URL}/approve/${threadId}`;