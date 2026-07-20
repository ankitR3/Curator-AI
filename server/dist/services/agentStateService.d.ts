import { Article, Summary, AgentMode } from '../types';
export declare const NewsletterState: import("@langchain/langgraph").AnnotationRoot<{
    goal: import("@langchain/langgraph").LastValue<string>;
    mode: import("@langchain/langgraph").LastValue<AgentMode>;
    plan: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    articles: import("@langchain/langgraph").BaseChannel<Article[], Article[] | import("@langchain/langgraph").OverwriteValue<Article[]>, unknown>;
    summaries: import("@langchain/langgraph").BaseChannel<Summary[], Summary[] | import("@langchain/langgraph").OverwriteValue<Summary[]>, unknown>;
    draftHtml: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    critique: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    approved: import("@langchain/langgraph").BaseChannel<boolean, boolean | import("@langchain/langgraph").OverwriteValue<boolean>, unknown>;
    revisionCount: import("@langchain/langgraph").BaseChannel<number, number | import("@langchain/langgraph").OverwriteValue<number>, unknown>;
    humanApproved: import("@langchain/langgraph").BaseChannel<boolean | null, boolean | import("@langchain/langgraph").OverwriteValue<boolean | null> | null, unknown>;
    finalOutput: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    log: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}>;
export type NewsletterStateType = typeof NewsletterState.State;
//# sourceMappingURL=agentStateService.d.ts.map