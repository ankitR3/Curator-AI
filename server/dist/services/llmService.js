"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLM = getLLM;
const groq_1 = require("@langchain/groq");
function getLLM(temperature = 0.4) {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('Missing GROQ_API_KEY in environment variables');
        }
        return new groq_1.ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            temperature,
        });
    }
    catch (err) {
        console.error('Failed to create Groq LLM client:', err);
        throw err;
    }
}
//# sourceMappingURL=llmService.js.map