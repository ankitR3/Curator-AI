import { getLLM, invokeLLMWithRetry } from './llmService';
import { Article, Summary } from '../types';

export async function summarizeArticles(articles: Article[]): Promise<Summary[]> {
  try {
    if (!articles || articles.length === 0) return [];
    const llm = getLLM(0.3);

    const topArticles = articles.slice(0, 7);
    const formattedArticles = topArticles
      .map((a, i) => `Article #${i + 1}\nTitle: ${a.title}\nURL: ${a.url}\nSnippet: ${(a.snippet || '').slice(0, 250)}`)
      .join('\n\n');

    const prompt = `Summarize each of the following ${topArticles.length} articles into a punchy 2-sentence summary.

Return ONLY a valid JSON array of objects with keys: "title", "url", and "summary". Ensure all string values including URLs are properly enclosed in double quotes.

Articles:
${formattedArticles}`;

    const res = await invokeLLMWithRetry(llm, prompt);
    const content = (res.content as string).trim();

    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      try {
        // Fix unquoted URLs if LLM produced unquoted URLs like "url": https://...
        const sanitizedJson = jsonMatch[0].replace(/"url"\s*:\s*(https?:\/\/[^\s,}"]+)/gi, '"url": "$1"');
        const parsed = JSON.parse(sanitizedJson);
        return parsed.map((item: any, i: number) => ({
          title: item.title || topArticles[i]?.title || 'Untitled',
          url: item.url || topArticles[i]?.url || '',
          summary: item.summary || (topArticles[i]?.snippet || '').slice(0, 200),
        }));
      } catch (parseErr) {
        console.warn('summarizeArticles JSON parse failed, using fallback articles:', parseErr);
      }
    }

    return topArticles.map((a) => ({
      title: a.title,
      url: a.url,
      summary: (a.snippet || '').slice(0, 200),
    }));
  } catch (err) {
    console.error('summarizeArticles failed:', err);
    return articles.slice(0, 7).map((a) => ({
      title: a.title,
      url: a.url,
      summary: (a.snippet || '').slice(0, 200),
    }));
  }
}