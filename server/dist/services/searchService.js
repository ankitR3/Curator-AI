"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAINews = searchAINews;
const tavily_1 = require("@langchain/tavily");
async function searchAINews(query) {
    try {
        if (!process.env.TAVILY_API_KEY) {
            throw new Error('Missing TAVILY_API_KEY in environment variables');
        }
        const tavily = new tavily_1.TavilySearch({
            maxResults: 8,
            tavilyApiKey: process.env.TAVILY_API_KEY,
        });
        const result = await tavily.invoke({ query });
        const rawResults = result?.results ?? [];
        return rawResults.map((r) => ({
            title: r.title || 'Untitled',
            url: r.url || '',
            snippet: r.content || r.snippet || '',
        }));
    }
    catch (err) {
        console.error('searchAINews failed:', err);
        throw err;
    }
}
//# sourceMappingURL=searchService.js.map