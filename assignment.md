# AI Developer Assignment

AI Developer Assignment:

Assignment Objective
Build a mini autonomous AI agent that can act as a "Newsletter Agent".

What You Need to Build
Create a single autonomous agent with the following capabilities:

1. Goal Input
The agent receives a plain English goal:
"Create a weekly newsletter on latest AI agent news and send it to our subscribers."

2. Agent Behavior (True Agentic)
- Research the latest AI agent news.
- Summarize the top 5–7 relevant articles.
- Generate a clean newsletter (HTML or Markdown).
- Simulate sending it (save as file or print the email content + subject).

3. Core Requirements
- Use multi-step reasoning (planning → research → writing → review → output).
- Show tool use (2–3 tools).
- Include self-reflection/critique.
- Make it autonomous with a single `run_newsletter_agent(goal)` function.
- Add a toggle between Fully Autonomous and Human-in-the-Loop mode.
- Write clean, well-structured code.

## Tech Stack
- LangChain or LangGraph
- Gemini, Grok, Claude, OpenAI, or Ollama
- Simple frontend to interact with the agent