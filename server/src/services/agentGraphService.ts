import { StateGraph, START, END, MemorySaver, interrupt } from '@langchain/langgraph';
import * as fs from 'fs';
import * as path from 'path';
import { NewsletterState, NewsletterStateType } from './agentStateService';
import { searchAINews } from './searchService';
import { summarizeArticles } from './summarizerService';
import { generateNewsletterHtml } from './htmlGeneratorService';
import { getLLM, invokeLLMWithRetry } from './llmService';

const MAX_REVISIONS = 2;

async function planNode(state: NewsletterStateType) {
  const llm = getLLM(0.2);
  const prompt = `Goal: "${state.goal}"\nIn one sentence, state the search query you'd use to find the latest, most relevant tech news. Return only the query, nothing else.`;
  const res = await invokeLLMWithRetry(llm, prompt);
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
  // Pacing delay to avoid Groq rate limit bursts
  await new Promise((r) => setTimeout(r, 2000));
  const feedback = state.revisionCount > 0 ? state.critique : undefined;
  const html = await generateNewsletterHtml(state.goal, state.summaries, feedback);
  return {
    draftHtml: html,
    log: [`Draft generated (revision #${state.revisionCount})`],
  };
}

async function reviewNode(state: NewsletterStateType) {
  const llm = getLLM(0);
  const plainText = (state.draftHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 1200);
  const prompt = `You are a strict editor reviewing a newsletter draft text.\n\nGoal: "${state.goal}"\n\nDraft Text:\n${plainText}\n\nCheck: does it cover the articles and is it well structured? Respond in this exact format:\nAPPROVED: yes|no\nFEEDBACK: <short actionable feedback if no, else "none">`;
  const res = await invokeLLMWithRetry(llm, prompt);
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
    console.log(`Saved to: ${filePath}`);
    console.log('========================================\n');
  } catch (err) {
    console.error('Failed to save output HTML file:', err);
  }

  return { finalOutput, log: ["Newsletter finalized, saved to output directory, and 'sent' (simulated)."] };
}

function shouldContinueAuto(state: NewsletterStateType) {
  if (state.approved) return "outputNode";
  if (state.revisionCount >= MAX_REVISIONS) return "outputNode";
  return "writeNode";
}

function shouldContinueHitl(state: NewsletterStateType) {
  if (state.humanApproved) return "outputNode";
  if (state.revisionCount >= MAX_REVISIONS) return "outputNode";
  return "writeNode";
}

const checkpointer = new MemorySaver();

export const autoGraph = new StateGraph(NewsletterState)
  .addNode("createPlan", planNode)
  .addNode("researchNode", researchNode)
  .addNode("summarizeNode", summarizeNode)
  .addNode("writeNode", writeNode)
  .addNode("reviewNode", reviewNode)
  .addNode("outputNode", outputNode)
  .addEdge(START, "createPlan")
  .addEdge("createPlan", "researchNode")
  .addEdge("researchNode", "summarizeNode")
  .addEdge("summarizeNode", "writeNode")
  .addEdge("writeNode", "reviewNode")
  .addConditionalEdges("reviewNode", shouldContinueAuto)
  .addEdge("outputNode", END)
  .compile({ checkpointer });

export const hitlGraph = new StateGraph(NewsletterState)
  .addNode("createPlan", planNode)
  .addNode("researchNode", researchNode)
  .addNode("summarizeNode", summarizeNode)
  .addNode("writeNode", writeNode)
  .addNode("reviewNode", reviewNode)
  .addNode("humanApprovalNode", humanApprovalNode)
  .addNode("outputNode", outputNode)
  .addEdge(START, "createPlan")
  .addEdge("createPlan", "researchNode")
  .addEdge("researchNode", "summarizeNode")
  .addEdge("summarizeNode", "writeNode")
  .addEdge("writeNode", "reviewNode")
  .addEdge("reviewNode", "humanApprovalNode")
  .addConditionalEdges("humanApprovalNode", shouldContinueHitl)
  .addEdge("outputNode", END)
  .compile({ checkpointer });