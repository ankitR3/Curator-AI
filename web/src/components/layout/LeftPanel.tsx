'use client';

import { useDashboardStore, cleanErrorMessage } from '@/src/store/useDashboardStore';
import { RUN_AGENT_URL } from '@/routes/api-routes';
import {
  Play,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Search,
  FileText,
  AlignLeft,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';

export default function LeftPanel() {
  const {
    goal,
    setGoal,
    mode,
    setMode,
    status,
    setStatus,
    setThreadId,
    setPendingDraft,
    setFinalOutput,
    setLogs,
    addLog,
    setErrorMessage,
    resetAgent,
    logs,
    errorMessage,
  } = useDashboardStore();

  const isRunning = status === 'running';

  const handleRunAgent = async () => {
    if (!goal.trim()) return;

    setStatus('running');
    setErrorMessage(null);
    setFinalOutput(null);
    setPendingDraft(null);
    setLogs(['Initiating Newsletter Agent pipeline...']);

    try {
      const res = await fetch(RUN_AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mode }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      if (data.status === 'awaiting_human_review') {
        setStatus('awaiting_human_review');
        setThreadId(data.threadId);
        setPendingDraft(data.pendingDraft || null);
        setLogs(data.log || []);
      } else {
        setStatus('completed');
        setThreadId(data.threadId);
        setFinalOutput(data.finalOutput || null);
        setLogs(data.log || []);
      }
    } catch (err: any) {
      console.error('runAgent error:', err);
      const formattedErr = cleanErrorMessage(err.message);
      setStatus('error');
      setErrorMessage(formattedErr);
      addLog(`Error: ${formattedErr}`);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (status === 'idle') return 'pending';
    if (status === 'error') return 'error';

    if (status === 'awaiting_human_review') {
      if (stepIndex < 3) return 'completed';
      if (stepIndex === 3) return 'active';
      return 'pending';
    }

    if (status === 'completed') return 'completed';

    if (isRunning) {
      const hasStep0 = logs.some((l) => l.includes('Planned search query'));
      const hasStep1 = logs.some((l) => l.includes('candidate articles'));
      const hasStep2 = logs.some((l) => l.includes('Summarized'));
      const hasStep3 = logs.some((l) => l.includes('Draft generated') || l.includes('Review'));

      if (stepIndex === 0) return hasStep0 ? 'completed' : 'active';
      if (stepIndex === 1) return hasStep1 ? 'completed' : hasStep0 ? 'active' : 'pending';
      if (stepIndex === 2) return hasStep2 ? 'completed' : hasStep1 ? 'active' : 'pending';
      if (stepIndex === 3) return hasStep3 ? 'completed' : hasStep2 ? 'active' : 'pending';
      if (stepIndex === 4) return hasStep3 ? 'active' : 'pending';
    }
    return 'pending';
  };

  const steps = [
    {
      title: 'Plan & Query',
      icon: Search,
      subtitle:
        logs.find((l) => l.includes('Planned search query'))?.replace(/^.*Planned search query:\s*/, '') ||
        (getStepStatus(0) === 'active' ? 'Planning search query...' : null),
    },
    {
      title: 'Web Research',
      icon: FileText,
      subtitle:
        logs.find((l) => l.includes('candidate articles')) ||
        (getStepStatus(1) === 'active' ? 'Searching web for articles...' : null),
    },
    {
      title: 'Article Summaries',
      icon: AlignLeft,
      subtitle:
        logs.find((l) => l.includes('Summarized')) ||
        (getStepStatus(2) === 'active' ? 'Summarizing articles with AI...' : null),
    },
    {
      title: 'Self-Critique Review',
      icon: ShieldCheck,
      subtitle:
        status === 'awaiting_human_review'
          ? 'Awaiting Human Approval'
          : status === 'completed'
          ? 'Approved by Human & Editor'
          : getStepStatus(3) === 'active'
          ? 'Drafting & self-critiquing newsletter...'
          : logs.some((l) => l.includes('needs revision'))
          ? 'Needs revision'
          : null,
    },
    {
      title: 'Simulated Send',
      icon: Send,
      subtitle:
        status === 'completed'
          ? 'Saved output file'
          : getStepStatus(4) === 'active'
          ? 'Finalizing & saving file...'
          : null,
    },
  ];

  return (
    <div className="w-full lg:w-[440px] xl:w-[460px] flex-shrink-0 min-w-0 bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 flex flex-col space-y-5 select-none overflow-y-auto overflow-x-hidden">
      {/* Goal Prompt Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400">
            Goal prompt
          </label>
          <button
            type="button"
            onClick={resetAgent}
            className="text-zinc-500 hover:text-zinc-300 transition focus:outline-none"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Weekly updates on AI developments, open source models, and tech news..."
          rows={4}
          disabled={isRunning}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none focus:ring-0 focus:border-zinc-800 resize-none leading-relaxed"
        />

        {/* Mode Switch Pills */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-md border border-zinc-800">
          <button
            type="button"
            onClick={() => setMode('auto')}
            disabled={isRunning}
            className={`py-2 px-3 rounded text-xs font-medium transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 select-none ${mode === 'auto'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
          >
            Fully Autonomous
          </button>
          <button
            type="button"
            onClick={() => setMode('hitl')}
            disabled={isRunning}
            className={`py-2 px-3 rounded text-xs font-medium transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 select-none ${mode === 'hitl'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
          >
            Human in the Loop
          </button>
        </div>

        {/* Run Action Button */}
        <button
          type="button"
          onClick={handleRunAgent}
          disabled={isRunning || !goal.trim()}
          className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs active:scale-[0.99] transition flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 flex items-start gap-2.5 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="break-words min-w-0">{errorMessage}</span>
        </div>
      )}

      <hr className="border-zinc-800/80" />

      {/* Agent Execution Pipeline Step List */}
      <div className="space-y-4 min-w-0">
        <div className="relative space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
          {steps.map((step, idx) => {
            const stepState = getStepStatus(idx);

            return (
              <div key={idx} className="relative flex items-center gap-3.5 pl-1 min-w-0">
                {/* Step Circle Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 flex-shrink-0 transition-colors ${stepState === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : stepState === 'active'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}
                >
                  {stepState === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : stepState === 'active' ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  ) : (
                    <span className="text-[11px] font-mono">{idx + 1}</span>
                  )}
                </div>

                {/* Step Name & Subtitle */}
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-zinc-200 block truncate">{step.title}</span>
                    {step.subtitle && (
                      <span className={`text-[11px] block truncate ${stepState === 'active' ? 'text-amber-400 font-medium' : 'text-zinc-500'}`}>
                        {step.subtitle}
                      </span>
                    )}
                  </div>

                  {idx === 3 && status === 'completed' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium flex-shrink-0">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
