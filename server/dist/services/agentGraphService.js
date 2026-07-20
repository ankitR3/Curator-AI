"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsletterGraph = void 0;
const langgraph_1 = require("@langchain/langgraph");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const agentStateService_1 = require("./agentStateService");
const searchService_1 = require("./searchService");
const summarizerService_1 = require("./summarizerService");
const htmlGeneratorService_1 = require("./htmlGeneratorService");
const llmService_1 = require("./llmService");
const MAX_REVISIONS = 2;
async function planNode(state) {
    const llm = (0, llmService_1.getLLM)(0.2);
    const res = await llm.invoke(`Goal: "${state.goal}"\n` +
        `In one sentence, state the search query you'd use to find the latest, most relevant AI agent news. ` +
        `Return only the query, nothing else.`);
    const plan = res.content.trim();
    return { plan, log: [`Planned search query: ${plan}`] };
}
async function researchNode(state) {
    const articles = await (0, searchService_1.searchAINews)(state.plan || state.goal);
    const top = articles.slice(0, 7);
    return { articles: top, log: [`Found ${top.length} candidate articles`] };
}
async function summarizeNode(state) {
    const summaries = await (0, summarizerService_1.summarizeArticles)(state.articles);
    return { summaries, log: [`Summarized ${summaries.length} articles`] };
}
async function writeNode(state) {
    const feedback = state.revisionCount > 0 ? state.critique : undefined;
    const html = await (0, htmlGeneratorService_1.generateNewsletterHtml)(state.goal, state.summaries, feedback);
    return {
        draftHtml: html,
        log: [`Draft generated (revision #${state.revisionCount})`],
    };
}
async function reviewNode(state) {
    const llm = (0, llmService_1.getLLM)(0);
    const res = await llm.invoke(`You are a strict editor reviewing a newsletter draft.\n\n` +
        `Goal: "${state.goal}"\n\nDraft HTML:\n${state.draftHtml}\n\n` +
        `Check: does it cover the summarized articles, is it well-structured, engaging, and free of ` +
        `placeholder/broken content? Respond in this exact format:\n` +
        `APPROVED: yes|no\nFEEDBACK: <specific actionable feedback if no, else "none">`);
    const text = res.content.trim();
    const approved = /APPROVED:\s*yes/i.test(text);
    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*)/i);
    const critique = feedbackMatch?.[1]?.trim() ?? "";
    return {
        approved,
        critique,
        revisionCount: state.revisionCount + (approved ? 0 : 1),
        log: [`Review: ${approved ? "approved" : "needs revision"}${critique ? " — " + critique : ""}`],
    };
}
async function humanApprovalNode(state) {
    const decision = (0, langgraph_1.interrupt)({
        reason: "human_review_required",
        draftHtml: state.draftHtml,
        message: "Reply with { approve: true } or { approve: false, feedback: '...' } to continue.",
    });
    if (!decision.approve) {
        return {
            humanApproved: false,
            critique: decision.feedback || "Human reviewer requested changes.",
            revisionCount: state.revisionCount + 1,
            log: [`Human rejected draft: ${decision.feedback || "no reason given"}`],
        };
    }
    return { humanApproved: true, log: ["Human approved draft"] };
}
async function outputNode(state) {
    const subject = `Your Weekly AI Agent Newsletter — ${new Date().toLocaleDateString()}`;
    const finalOutput = `SUBJECT: ${subject}\n\n${state.draftHtml}`;
    try {
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const filename = `newsletter_${Date.now()}.html`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, state.draftHtml, 'utf-8');
        fs.writeFileSync(path.join(outputDir, 'latest_newsletter.html'), state.draftHtml, 'utf-8');
        console.log('\n========================================');
        console.log(' SIMULATED EMAIL SENT ');
        console.log('========================================');
        console.log(`SUBJECT: ${subject}`);
        console.log(`SAVED TO: ${filePath}`);
        console.log('========================================\n');
    }
    catch (err) {
        console.error('Failed to save simulated newsletter to file:', err);
    }
    return {
        finalOutput,
        log: ["Newsletter finalized, saved to output directory, and 'sent' (simulated)."],
    };
}
function routeAfterReview(state) {
    if (state.approved) {
        return state.mode === "hitl" ? "humanApproval" : "output";
    }
    if (state.revisionCount >= MAX_REVISIONS) {
        return state.mode === "hitl" ? "humanApproval" : "output";
    }
    return "write";
}
function routeAfterHumanApproval(state) {
    if (state.humanApproved)
        return "output";
    if (state.revisionCount >= MAX_REVISIONS)
        return "output";
    return "write";
}
const graph = new langgraph_1.StateGraph(agentStateService_1.NewsletterState)
    .addNode('createPlan', planNode)
    .addNode('research', researchNode)
    .addNode('summarize', summarizeNode)
    .addNode('write', writeNode)
    .addNode('review', reviewNode)
    .addNode('humanApproval', humanApprovalNode)
    .addNode('output', outputNode)
    .addEdge(langgraph_1.START, 'createPlan')
    .addEdge('createPlan', 'research')
    .addEdge('research', 'summarize')
    .addEdge('summarize', 'write')
    .addEdge('write', 'review')
    .addConditionalEdges('review', routeAfterReview, ['write', 'humanApproval', 'output'])
    .addConditionalEdges('humanApproval', routeAfterHumanApproval, ['write', 'output'])
    .addEdge('output', langgraph_1.END);
const checkpointer = new langgraph_1.MemorySaver();
exports.newsletterGraph = graph.compile({ checkpointer });
//# sourceMappingURL=agentGraphService.js.map