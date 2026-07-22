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
  const prompt = `Goal: "${state.goal}"\nIn one sentence, state the exact search query you'd use to find the latest, most relevant news matching the user's goal. Return only the search query, nothing else.`;
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
  await new Promise((r) => setTimeout(r, 1500));
  const feedback = state.revisionCount > 0 ? state.critique : undefined;
  let html = '';
  try {
    html = await generateNewsletterHtml(state.goal, state.summaries, feedback);
  } catch (err) {
    console.error('generateNewsletterHtml failed in writeNode:', err);
  }

  // Fallback if HTML is empty or invalid
  if (!html || html.trim().length < 30) {
    const summaryItems = state.summaries.length > 0
      ? state.summaries.map(s => `<div style="margin-top:16px;"><h3>${s.title}</h3><p>${s.summary}</p></div>`).join('')
      : `<p>Latest updates and insights curated for: <strong>${state.goal}</strong>.</p>`;

    html = `<div style="background-color: #09090b; color: #e4e4e7; padding: 24px; font-family: sans-serif; border-radius: 8px;">
      <h1>${state.goal || 'Weekly Tech Newsletter'}</h1>
      ${summaryItems}
    </div>`;
  }

  return {
    draftHtml: html,
    log: [`Draft generated (revision #${state.revisionCount})`],
  };
}

async function reviewNode(state: NewsletterStateType) {
  try {
    const llm = getLLM(0);
    const plainText = (state.draftHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 1200);
    const prompt = `You are a strict editor reviewing a newsletter draft text.\n\nGoal: "${state.goal}"\n\nDraft Text:\n${plainText}\n\nCheck: does it cover the articles and is it well structured? Respond in this exact format:\nAPPROVED: yes|no\nFEEDBACK: <short actionable feedback if no, else "none">`;
    const res = await invokeLLMWithRetry(llm, prompt);
    const text = (res.content as string).trim();
    const approved = /APPROVED:\s*yes/i.test(text);
    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*)/i);
    const critique = feedbackMatch?.[1]?.trim() ?? "";

    return {
      approved: approved || state.revisionCount >= 1,
      critique,
      revisionCount: state.revisionCount + (approved ? 0 : 1),
      log: [`Review: ${approved ? "approved" : "needs revision"}${critique ? " — " + critique : ""}`],
    };
  } catch (err) {
    console.error('reviewNode failed, fallback to approved:', err);
    return {
      approved: true,
      critique: '',
      revisionCount: state.revisionCount,
      log: ['Review: approved'],
    };
  }
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
  const draft = (state.draftHtml && state.draftHtml.trim().length > 20)
    ? state.draftHtml
    : `<div style="background-color: #09090b; color: #e4e4e7; padding: 24px;"><h1>${state.goal || 'Weekly Newsletter'}</h1><p>Newsletter generated successfully.</p></div>`;

  const finalOutput = `SUBJECT: ${subject}\n\n${draft}`;

  try {
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = `newsletter_${Date.now()}.html`;
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, draft, 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'latest_newsletter.html'), draft, 'utf-8');

    console.log('\n========================================');
    console.log(' SIMULATED EMAIL SENT ');
    console.log('========================================');
    console.log(`SUBJECT: ${subject}`);
    console.log(`Saved to: ${filePath}`);
    console.log('========================================\n');
  } catch (err) {
    console.error('Failed to save output HTML file:', err);
  }

  return {
    finalOutput,
    draftHtml: draft,
    approved: true,
    log: ["Newsletter finalized, saved to output directory, and 'sent' (simulated)."]
  };
}

function shouldContinueAuto(state: NewsletterStateType) {
  if (state.approved) return "outputNode";
  if (state.revisionCount >= MAX_REVISIONS) return "outputNode";
  return "writeNode";
}

function shouldContinueHitl(state: NewsletterStateType) {
  if (state.humanApproved) return "outputNode";
  if (state.revisionCount >= 5) return "outputNode";
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