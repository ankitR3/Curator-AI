"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewsletterHtml = generateNewsletterHtml;
const llmService_1 = require("./llmService");
async function generateNewsletterHtml(goal, summaries, revisionFeedback) {
    try {
        const llm = (0, llmService_1.getLLM)(0.5);
        const itemsBlock = summaries
            .map((s, i) => `${i + 1}. ${s.title} (${s.url})\n${s.summary}`)
            .join('\n\n');
        const prompt = `You are writing a weekly email newsletter.

Original goal: "${goal}"

Here are the summarized articles to include:
${itemsBlock}

${revisionFeedback ? `IMPORTANT — address this feedback from a previous review:\n${revisionFeedback}\n` : ''}

Produce a complete, self-contained HTML email:
- <h1> title for the newsletter (e.g. "This Week in AI Agents")
- One short intro paragraph
- Each article as a section: bold title (linked to its URL), then its summary
- A short friendly sign-off
- Use simple inline CSS so it renders well in email clients (no external stylesheets)
- Return ONLY the HTML, no markdown code fences, no commentary`;
        const res = await llm.invoke(prompt);
        let html = res.content.trim();
        html = html.replace(/^```html\s*/i, '').replace(/```$/, '').trim();
        return html;
    }
    catch (err) {
        console.error('generateNewsletterHtml failed:', err);
        throw err;
    }
}
//# sourceMappingURL=htmlGeneratorService.js.map