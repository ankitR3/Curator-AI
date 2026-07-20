export declare const newsletterGraph: import("@langchain/langgraph").CompiledStateGraph<{
    goal: string;
    mode: import("../types").AgentMode;
    plan: string;
    articles: import("../types").Article[];
    summaries: import("../types").Summary[];
    draftHtml: string;
    critique: string;
    approved: boolean;
    revisionCount: number;
    humanApproved: boolean | null;
    finalOutput: string;
    log: string[];
}, {
    goal?: string;
    mode?: import("../types").AgentMode;
    plan?: string | import("@langchain/langgraph").OverwriteValue<string>;
    articles?: import("../types").Article[] | import("@langchain/langgraph").OverwriteValue<import("../types").Article[]>;
    summaries?: import("../types").Summary[] | import("@langchain/langgraph").OverwriteValue<import("../types").Summary[]>;
    draftHtml?: string | import("@langchain/langgraph").OverwriteValue<string>;
    critique?: string | import("@langchain/langgraph").OverwriteValue<string>;
    approved?: boolean | import("@langchain/langgraph").OverwriteValue<boolean>;
    revisionCount?: number | import("@langchain/langgraph").OverwriteValue<number>;
    humanApproved?: boolean | import("@langchain/langgraph").OverwriteValue<boolean | null> | null;
    finalOutput?: string | import("@langchain/langgraph").OverwriteValue<string>;
    log?: string[] | import("@langchain/langgraph").OverwriteValue<string[]>;
}, "__start__" | "createPlan" | "humanApproval" | "output" | "research" | "review" | "summarize" | "write", {
    goal: import("@langchain/langgraph").LastValue<string>;
    mode: import("@langchain/langgraph").LastValue<import("../types").AgentMode>;
    plan: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    articles: import("@langchain/langgraph").BaseChannel<import("../types").Article[], import("../types").Article[] | import("@langchain/langgraph").OverwriteValue<import("../types").Article[]>, unknown>;
    summaries: import("@langchain/langgraph").BaseChannel<import("../types").Summary[], import("../types").Summary[] | import("@langchain/langgraph").OverwriteValue<import("../types").Summary[]>, unknown>;
    draftHtml: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    critique: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    approved: import("@langchain/langgraph").BaseChannel<boolean, boolean | import("@langchain/langgraph").OverwriteValue<boolean>, unknown>;
    revisionCount: import("@langchain/langgraph").BaseChannel<number, number | import("@langchain/langgraph").OverwriteValue<number>, unknown>;
    humanApproved: import("@langchain/langgraph").BaseChannel<boolean | null, boolean | import("@langchain/langgraph").OverwriteValue<boolean | null> | null, unknown>;
    finalOutput: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    log: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}, {
    goal: import("@langchain/langgraph").LastValue<string>;
    mode: import("@langchain/langgraph").LastValue<import("../types").AgentMode>;
    plan: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    articles: import("@langchain/langgraph").BaseChannel<import("../types").Article[], import("../types").Article[] | import("@langchain/langgraph").OverwriteValue<import("../types").Article[]>, unknown>;
    summaries: import("@langchain/langgraph").BaseChannel<import("../types").Summary[], import("../types").Summary[] | import("@langchain/langgraph").OverwriteValue<import("../types").Summary[]>, unknown>;
    draftHtml: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    critique: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    approved: import("@langchain/langgraph").BaseChannel<boolean, boolean | import("@langchain/langgraph").OverwriteValue<boolean>, unknown>;
    revisionCount: import("@langchain/langgraph").BaseChannel<number, number | import("@langchain/langgraph").OverwriteValue<number>, unknown>;
    humanApproved: import("@langchain/langgraph").BaseChannel<boolean | null, boolean | import("@langchain/langgraph").OverwriteValue<boolean | null> | null, unknown>;
    finalOutput: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    log: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
}, import("@langchain/langgraph").StateDefinition, {
    createPlan: {
        plan: string;
        log: string[];
    };
    humanApproval: {
        humanApproved: boolean;
        critique: string;
        revisionCount: number;
        log: string[];
    } | {
        critique?: never;
        revisionCount?: never;
        humanApproved: boolean;
        log: string[];
    };
    output: {
        finalOutput: string;
        log: string[];
    };
    research: {
        articles: import("../types").Article[];
        log: string[];
    };
    review: {
        approved: boolean;
        critique: string;
        revisionCount: number;
        log: string[];
    };
    summarize: {
        summaries: import("../types").Summary[];
        log: string[];
    };
    write: {
        draftHtml: string;
        log: string[];
    };
}, unknown, unknown, []>;
//# sourceMappingURL=agentGraphService.d.ts.map