import { StateGraph, START, END, MemorySaver, interrupt } from '@langchain/langgraph';
import * as fs from 'fs';
import * as path from 'path';
import { NewsletterState, NewsletterStateType } from './agentStateService';
import { searchAINews } from './searchService';
import { summarizeArticles } from './summarizerService';
import { generateNewsletterHtml } from './htmlGeneratorService';
import { getLLM } from './llmService';

const MAX_REVISIONS = 2;

async function planNode(state: NewsletterStateType) {
  const llm = getLLM(0.2);
  const res = await llm.invoke(
    `Goal: "${state.goal}"\n` +
    `In one sentence, state the search query you'd use to find the latest, most relevant AI agent news. ` +
    `Return only the query, nothing else.`
  );
  const plan = (res.content as string).trim();
  return { plan, log: [`Planned search query: ${plan}`] };
}

async function researchNode(state: NewsletterStateType) {
  const articles = await searchAINews(state.plan || state.goal);
  const top = articles.slice(0, 7);
  return { articles: top, log: [`Found ${top.length} candidate articles`] };
}

async function summarizeNode(state: NewsletterStateType) {
  const summaries = await summarizeArticles(state.articles);
  return { summaries, log: [`Summarized ${summaries.length} articles`] };
}

async function writeNode(state: NewsletterStateType) {
  const feedback = state.revisionCount > 0 ? state.critique : undefined;
  const html = await generateNewsletterHtml(state.goal, state.summaries, feedback);
  return {
    draftHtml: html,
    log: [`Draft generated (revision #${state.revisionCount})`],
  };
}

async function reviewNode(state: NewsletterStateType) {
  const llm = getLLM(0);
  const res = await llm.invoke(
    `You are a strict editor reviewing a newsletter draft.\n\n` +
    `Goal: "${state.goal}"\n\nDraft HTML:\n${state.draftHtml}\n\n` +
    `Check: does it cover the summarized articles, is it well-structured, engaging, and free of ` +
    `placeholder/broken content? Respond in this exact format:\n` +
    `APPROVED: yes|no\nFEEDBACK: <specific actionable feedback if no, else "none">`
  );
  const text = (res.content as string).trim();
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

async function humanApprovalNode(state: NewsletterStateType) {
  const decision = interrupt({
    reason: "human_review_required",
    draftHtml: state.draftHtml,
    message: "Reply with { approve: true } or { approve: false, feedback: '...' } to continue.",
  }) as { approve: boolean; feedback?: string };

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

async function outputNode(state: NewsletterStateType) {
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
  } catch (err) {
    console.error('Failed to save simulated newsletter to file:', err);
  }

  return {
    finalOutput,
    log: ["Newsletter finalized, saved to output directory, and 'sent' (simulated)."],
  };
}

function routeAfterReview(state: NewsletterStateType): string {
  if (state.approved) {
    return state.mode === "hitl" ? "humanApproval" : "output";
  }
  if (state.revisionCount >= MAX_REVISIONS) {
    return state.mode === "hitl" ? "humanApproval" : "output";
  }
  return "write";
}

function routeAfterHumanApproval(state: NewsletterStateType): string {
  if (state.humanApproved) return "output";
  if (state.revisionCount >= MAX_REVISIONS) return "output";
  return "write";
}

const graph = new StateGraph(NewsletterState)
  .addNode('createPlan', planNode)
  .addNode('research', researchNode)
  .addNode('summarize', summarizeNode)
  .addNode('write', writeNode)
  .addNode('review', reviewNode)
  .addNode('humanApproval', humanApprovalNode)
  .addNode('output', outputNode)
  .addEdge(START, 'createPlan')
  .addEdge('createPlan', 'research')
  .addEdge('research', 'summarize')
  .addEdge('summarize', 'write')
  .addEdge('write', 'review')
  .addConditionalEdges('review', routeAfterReview, ['write', 'humanApproval', 'output'])
  .addConditionalEdges('humanApproval', routeAfterHumanApproval, ['write', 'output'])
  .addEdge('output', END);

const checkpointer = new MemorySaver();
export const newsletterGraph = graph.compile({ checkpointer });