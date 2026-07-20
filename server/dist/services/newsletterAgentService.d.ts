import { AgentMode, AgentRunResult } from '../types';
export declare function runNewsletterAgent(goal: string, mode?: AgentMode): Promise<AgentRunResult>;
export declare function approveNewsletter(threadId: string, approve: boolean, feedback?: string): Promise<AgentRunResult>;
//# sourceMappingURL=newsletterAgentService.d.ts.map