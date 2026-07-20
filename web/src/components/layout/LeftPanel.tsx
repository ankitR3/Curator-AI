'use client';

import { useDashboardStore } from '@/src/store/useDashboardStore';
import { 
  Play, 
  RotateCcw, 
  Loader2, 
  CheckCircle2, 
  Search, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Send,
  Terminal,
  AlertCircle
} from 'lucide-react';

export default function LeftPanel() {
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
      title: 'Plan & Query',
      icon: Search,
      subtitle: logs.find((l) => l.includes('Planned search query'))?.replace(/^.*Planned search query:\s*/, '') || null,
    },
    {
      title: 'Web Research',
      icon: FileText,
      subtitle: logs.find((l) => l.includes('candidate articles')) || (status === 'idle' ? null : '7 articles'),
    },
    {
      title: 'AI Summaries',
      icon: Sparkles,
      subtitle: logs.find((l) => l.includes('Summarized')) || null,
    },
    {
      title: 'Self-Critique Review',
      icon: ShieldCheck,
      subtitle: logs.find((l) => l.includes('Review')) || null,
    },
    {
      title: 'Simulated Send',
      icon: Send,
      subtitle: status === 'completed' ? 'Saved output file' : null,
    },
  ];

  return (
    <div className="w-full lg:w-[460px] xl:w-[480px] bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col space-y-5 select-none overflow-y-auto">
      {/* Goal Prompt Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400">
            Goal prompt
          </label>
          <button
            onClick={resetAgent}
            className="text-zinc-500 hover:text-zinc-300 transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Create a weekly newsletter on latest AI agent news and send it to our subscribers"
          rows={4}
          disabled={isRunning}
          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none leading-relaxed transition"
        />

        {/* Mode Switch Pills */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950/90 rounded-xl border border-zinc-800/90">
          <button
            onClick={() => setMode('auto')}
            disabled={isRunning}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
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
            className={`py-2 px-3 rounded-lg text-xs font-medium transition ${
              mode === 'hitl'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Human in the Loop
          </button>
        </div>

        {/* Run Action Button */}
        <button
          onClick={runAgent}
          disabled={isRunning || !goal.trim()}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Agent...</span>
            </>
          ) : (
            <span>Run Newsletter Agent</span>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="break-words">{errorMessage}</span>
        </div>
      )}

      <hr className="border-zinc-800/80" />

      {/* Agent Execution Pipeline Step List */}
      <div className="space-y-4">
        <div className="relative space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800/80">
          {steps.map((step, idx) => {
            const stepState = getStepStatus(idx);

            return (
              <div key={idx} className="relative flex items-center gap-3.5 pl-1">
                {/* Step Circle */}
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : stepState === 'active' ? (
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                  ) : (
                    <span className="text-[11px] font-mono">{idx + 1}</span>
                  )}
                </div>

                {/* Step Name & Subtitle */}
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block">{step.title}</span>
                    {step.subtitle && (
                      <span className="text-[11px] text-zinc-500 block truncate">{step.subtitle}</span>
                    )}
                  </div>

                  {idx === 3 && logs.some((l) => l.includes('Review: approved')) && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs Window */}
      {logs.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-900 pb-1.5 font-sans font-medium text-xs">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Execution Trace Logs</span>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1 text-zinc-400 pt-1">
            {logs.map((log, i) => (
              <div key={i} className="break-words">
                <span className="text-zinc-600 mr-1.5">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
