import { Annotation } from '@langchain/langgraph';
import { Article, Summary, AgentMode } from '../types';

export const NewsletterState = Annotation.Root({
  goal: Annotation<string>(),
  mode: Annotation<AgentMode>(),

  plan: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),

  articles: Annotation<Article[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  summaries: Annotation<Summary[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  draftHtml: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),

  critique: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),

  approved: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),

  revisionCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),

  humanApproved: Annotation<boolean | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  finalOutput: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => '',
  }),

  log: Annotation<string[]>({
    reducer: (prev, next) => prev.concat(next),
    default: () => [],
  }),
});

export type NewsletterStateType = typeof NewsletterState.State;