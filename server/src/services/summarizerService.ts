import { getLLM } from './llmService';
import { Article, Summary } from '../types';

export async function summarizeArticles(articles: Article[]): Promise<Summary[]> {
  try {
    const llm = getLLM(0.3);

    const summaries = await Promise.all(
      articles.map(async (article) => {
        const prompt = `You are summarizing a news article for a weekly AI-agent-focused newsletter.

Title: ${article.title}
URL: ${article.url}
Content/snippet: ${article.snippet}

Write a punchy 2-3 sentence summary aimed at developers interested in AI agents.
Only return the summary text, no preamble.`;

        const res = await llm.invoke(prompt);
        return {
          title: article.title,
          url: article.url,
          summary: (res.content as string).trim(),
        };
      })
    );

    return summaries;
  } catch (err) {
    console.error('summarizeArticles failed:', err);
    throw err;
  }
}