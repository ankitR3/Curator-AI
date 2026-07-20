"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterState = void 0;
const langgraph_1 = require("@langchain/langgraph");
exports.NewsletterState = langgraph_1.Annotation.Root({
    goal: (0, langgraph_1.Annotation)(),
    mode: (0, langgraph_1.Annotation)(),
    plan: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => '',
    }),
    articles: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => [],
    }),
    summaries: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => [],
    }),
    draftHtml: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => '',
    }),
    critique: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => '',
    }),
    approved: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => false,
    }),
    revisionCount: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => 0,
    }),
    humanApproved: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => null,
    }),
    finalOutput: (0, langgraph_1.Annotation)({
        reducer: (_prev, next) => next,
        default: () => '',
    }),
    log: (0, langgraph_1.Annotation)({
        reducer: (prev, next) => prev.concat(next),
        default: () => [],
    }),
});
//# sourceMappingURL=agentStateService.js.map