import { ChatGroq } from '@langchain/groq';

export function getLLM(temperature = 0.4) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY in environment variables');
    }
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.1-8b-instant',
      temperature,
      maxRetries: 5,
    });
  } catch (err) {
    console.error('Failed to create Groq LLM client:', err);
    throw err;
  }
}

export async function invokeLLMWithRetry(llm: ChatGroq, prompt: any, maxAttempts = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await llm.invoke(prompt);
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Rate limit');
      if (isRateLimit && attempt < maxAttempts) {
        console.warn(`[Groq Rate Limit] Waiting 8 seconds before retry (Attempt ${attempt}/${maxAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, 8000));
      } else {
        throw err;
      }
    }
  }
}