import { getLLM, invokeLLMWithRetry } from './llmService';
import { Summary } from '../types';

function sanitizeNewsletterHtml(rawHtml: string): string {
  let html = rawHtml;

  // 1. Remove any HTML block/element containing sign-off keywords, "Stay tuned", "Best regards", etc.
  html = html.replace(/<(p|div|span|h[1-6]|section|footer)[^>]*>[\s\S]*?(Best regards|Warm regards|Kind regards|Sincerely|Stay tuned|Stay up-to-date|Stay informed|Join the conversation|follow us)[\s\S]*?<\/\1>/gi, '');

  // 2. Truncate any lingering sign-off block starting with "Best regards", "Warm regards", etc.
  html = html.replace(/(Best regards|Warm regards|Kind regards|Sincerely)[\s\S]*/gi, '');

  // 3. Remove standalone placeholders like [Your Name], [Name], [Your Title]
  html = html.replace(/\[\s*(Your Name|Author Name|Name|Your Title)\s*\]/gi, '');

  // 4. Remove all hyperlinks (unwrap <a> tags so link text remains plain text)
  html = html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');

  // 5. Convert Markdown bold syntax (**text**) to HTML <strong>text</strong> and strip any stray asterisks
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*\*/g, '');

  // 6. Remove empty residual tags created by stripping
  html = html.replace(/<(p|div|span)[^>]*>\s*<\/\1>/gi, '');

  return html.trim();
}

export async function generateNewsletterHtml(
  goal: string,
  summaries: Summary[],
  revisionFeedback?: string
): Promise<string> {
  try {
    const llm = getLLM(0.6);

    const itemsBlock = summaries
      .map((s, i) => `${i + 1}. ${s.title}\n${s.summary}`)
      .join('\n\n');

    const prompt = `You are a master newsletter writer crafting a weekly tech newsletter.

Original goal: "${goal}"

Here are the summarized articles to include:
${itemsBlock}

${revisionFeedback ? `IMPORTANT — address this feedback from a previous review:\n${revisionFeedback}\n` : ''}

Drafting Requirements:
- Catchy <h1> title for the newsletter (e.g. "This Week in AI & Tech")
- Engaging multi-paragraph introduction analyzing the week's overall tech landscape
- Feature Stories: Write a detailed section for each article (150-200 words per story). Bold headline using <h2> or <h3> tags (DO NOT use markdown ** asterisks or <a> tags), followed by analysis and key developer takeaways.
- Key Takeaways summary section highlighting top insights
- ABSOLUTELY NO MARKDOWN ASTESISKS: Do NOT output ** double asterisks anywhere. Use standard HTML tags (<h2>, <h3>, <strong>, <p>) only.
- ABSOLUTELY NO LINKS: Do NOT output any <a> tags or URLs anywhere in the newsletter.
- ABSOLUTELY NO SIGN-OFF: Do NOT include any closing signatures, "Stay tuned", "Stay Informed" footers, social media follow lines, or placeholder sign-offs (such as "Best regards, [Your Name]"). End the newsletter directly after the key insights section.
- Simple inline CSS: crisp light readable text (#e4e4e7) on dark background (#09090b).
- Wrap the entire newsletter body in a container: <div style="background-color: #09090b; color: #e4e4e7; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-radius: 8px; border: 1px solid #27272a;">...</div>
- Return ONLY valid HTML code, no markdown code fences, no commentary`;

    const res = await invokeLLMWithRetry(llm, prompt);
    let html = (res.content as string).trim();

    html = html.replace(/^```html\s*/i, '').replace(/```$/, '').trim();

    // Sanitize to guarantee removal of any sign-offs, closing footers, or placeholders
    html = sanitizeNewsletterHtml(html);

    return html;
  } catch (err) {
    console.error('generateNewsletterHtml failed:', err);
    throw err;
  }
}