'use client';

import { useDashboardStore } from '@/src/store/useDashboardStore';
import { 
  Play, 
  RotateCcw, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  Search, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Send,
  Terminal,
  AlertCircle
} from 'lucide-react';

export default function MiddleContentbar() {
  const {
    goal,
    setGoal,
    mode,
    setMode,
    status,
    runAgent,
    resetAgent,
    logs,
    errorMessage,
  } = useDashboardStore();

  const isRunning = status === 'running';

  // Helper to determine step completion status
  const getStepStatus = (stepIndex: number) => {
    if (status === 'idle') return 'pending';
    if (status === 'error') return 'error';
    if (status === 'completed' || status === 'awaiting_human_review') return 'completed';
    if (isRunning) {
      if (stepIndex === 0 && logs.some((l) => l.includes('Planned search query'))) return 'completed';
      if (stepIndex === 1 && logs.some((l) => l.includes('candidate articles'))) return 'completed';
      if (stepIndex === 2 && logs.some((l) => l.includes('Summarized'))) return 'completed';
      if (stepIndex === 3 && logs.some((l) => l.includes('Review'))) return 'completed';
      return 'active';
    }
    return 'pending';
  };

  const steps = [
    {
      title: 'Plan & Search Query',
      icon: Search,
      description: logs.find((l) => l.includes('Planned search query'))?.replace(/^.*Planned search query:\s*/, '') || 'Formulates optimal search strategy',
    },
    {
      title: 'Web Research',
      icon: FileText,
      description: logs.find((l) => l.includes('candidate articles')) || 'Scrapes top news sources via Tavily API',
    },
    {
      title: 'AI Summarization',
      icon: Sparkles,
      description: logs.find((l) => l.includes('Summarized')) || 'Synthesizes key article takeaways',
    },
    {
      title: 'Self-Critique Review',
      icon: ShieldCheck,
      description: logs.find((l) => l.includes('Review')) || 'AI Editor checks draft structure & quality',
    },
    {
      title: 'Simulated Dispatch',
      icon: Send,
      description: status === 'completed' ? 'Output saved to output/latest_newsletter.html' : 'Saves newsletter & logs dispatch',
    },
  ];

  return (
    <div className="h-screen w-full md:w-[480px] lg:w-[520px] bg-zinc-950 border-r border-zinc-800/80 flex flex-col p-5 overflow-y-auto select-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Newsletter Agent</h1>
          <p className="text-xs text-zinc-400">Configure goal & execution mode</p>
        </div>
        <button
          onClick={resetAgent}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          title="Reset Agent State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Goal Prompt Card */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 space-y-3 shadow-md">
        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Goal Prompt
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter a plain English goal for the newsletter agent..."
          rows={3}
          disabled={isRunning}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition"
        />

        {/* Mode Switch Toggle */}
        <div className="pt-2">
          <label className="block text-[11px] font-medium text-zinc-400 mb-2">
            Execution Mode:
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setMode('auto')}
              disabled={isRunning}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                mode === 'auto'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Fully Autonomous
            </button>
            <button
              onClick={() => setMode('hitl')}
              disabled={isRunning}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                mode === 'hitl'
                  ? 'bg-indigo-600/90 text-white border border-indigo-500/60 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Human-in-the-Loop
            </button>
          </div>
        </div>

        {/* Run Action Button */}
        <button
          onClick={runAgent}
          disabled={isRunning || !goal.trim()}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Agent Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Newsletter Agent</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Execution Error</p>
            <p className="text-red-300/80 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Agent Execution Pipeline Step Tracker */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Agent Execution Pipeline
        </h2>

        <div className="relative space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
          {steps.map((step, idx) => {
            const stepState = getStepStatus(idx);
            const Icon = step.icon;

            return (
              <div key={idx} className="relative flex items-start gap-3.5 pl-1">
                {/* Step Circle Status Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 transition-colors ${
                    stepState === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : stepState === 'active'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/60 animate-pulse'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {stepState === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : stepState === 'active' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <span className="text-[11px] font-mono">{idx + 1}</span>
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{step.title}</span>
                    {idx === 3 && logs.some((l) => l.includes('Review: approved')) && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                        Approved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Real-Time Logs Accordion */}
      {logs.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-zinc-300">
                Live Execution Logs
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">{logs.length} entries</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 text-[11px]">
            {logs.map((log, i) => (
              <div key={i} className="text-zinc-300 flex items-start gap-2">
                <span className="text-zinc-600 select-none">&gt;</span>
                <span className="break-words">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
