import { TavilySearch } from '@langchain/tavily';
import { Article } from '../types';

export async function searchAINews(query: string): Promise<Article[]> {
  try {
    if (!process.env.TAVILY_API_KEY) {
      throw new Error('Missing TAVILY_API_KEY in environment variables');
    }

    const tavily = new TavilySearch({
      maxResults: 8,
      tavilyApiKey: process.env.TAVILY_API_KEY,
    });

    const result = await tavily.invoke({ query } as any);
    const rawResults = (result as any)?.results ?? [];

    return rawResults.map((r: any) => ({
      title: r.title || 'Untitled',
      url: r.url || '',
      snippet: r.content || r.snippet || '',
    }));
  } catch (err) {
    console.error('searchAINews failed:', err);
    throw err;
  }
}