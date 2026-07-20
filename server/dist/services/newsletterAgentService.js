"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNewsletterAgent = runNewsletterAgent;
exports.approveNewsletter = approveNewsletter;
const uuid_1 = require("uuid");
const agentGraphService_1 = require("./agentGraphService");
async function runNewsletterAgent(goal, mode = 'auto') {
    try {
        const threadId = (0, uuid_1.v4)();
        const config = { configurable: { thread_id: threadId } };
        const result = await agentGraphService_1.newsletterGraph.invoke({ goal, mode }, config);
        const interrupted = result.__interrupt__;
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
    }
    catch (err) {
        console.error('runNewsletterAgent failed:', err);
        throw err;
    }
}
async function approveNewsletter(threadId, approve, feedback) {
    try {
        const config = { configurable: { thread_id: threadId } };
        const { Command } = await import('@langchain/langgraph');
        const result = await agentGraphService_1.newsletterGraph.invoke(new Command({ resume: { approve, feedback } }), config);
        const interrupted = result.__interrupt__;
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
    }
    catch (err) {
        console.error('approveNewsletter failed:', err);
        throw err;
    }
}
//# sourceMappingURL=newsletterAgentService.js.map