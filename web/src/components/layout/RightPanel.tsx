'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { 
  Download, 
  CheckCircle, 
  X, 
  Mail, 
  Sparkles, 
  Send, 
  Loader2,
  Code,
  Eye
} from 'lucide-react';

export default function RightPanel() {
  const {
    status,
    finalOutput,
    pendingDraft,
    approveAgent,
    feedback,
    setFeedback,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawContent = finalOutput || pendingDraft || '';
  const htmlContent = rawContent.replace(/^SUBJECT:.*\n+/i, '').trim();
  const subjectMatch = rawContent.match(/^SUBJECT:\s*(.*)/i);
  const subjectTitle = subjectMatch ? subjectMatch[1] : 'This Week in AI Agents';

  const handleDownloadHtml = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleHumanDecision = async (approve: boolean) => {
    setIsSubmitting(true);
    await approveAgent(approve);
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Tabs & Toolbar */}
      <div className="h-12 border-b border-zinc-800/80 px-5 flex items-center justify-between bg-zinc-950/40">
        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-1.5 px-2 border-b-2 transition ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Email preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-1.5 px-2 border-b-2 transition ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Email (Source)
          </button>
        </div>

        {htmlContent && (
          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download HTML</span>
          </button>
        )}
      </div>

      {/* Main Email Render Preview */}
      <div className="flex-1 p-5 overflow-y-auto flex items-center justify-center bg-zinc-950/40">
        {htmlContent ? (
          activeTab === 'preview' ? (
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl my-auto">
              {/* Rendered HTML view */}
              <div className="p-6 bg-zinc-950 text-zinc-100 max-h-[580px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto my-auto max-h-[580px]">
              <pre className="whitespace-pre-wrap break-all">{htmlContent}</pre>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">No Email Draft Generated</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enter your goal prompt in the left panel and click <strong className="text-zinc-300">Run Newsletter Agent</strong> to preview the output.
            </p>
          </div>
        )}
      </div>

      {/* Floating Human-in-the-Loop Review Banner */}
      {status === 'awaiting_human_review' && (
        <div className="m-4 bg-zinc-950/95 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h4 className="text-xs font-semibold text-zinc-200">
                Human-in-the-Loop review
              </h4>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Request specific revisions or leave blank to approve..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleHumanDecision(true)}
                disabled={isSubmitting}
                className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Approve &amp; Dispatch</span>
              </button>

              <button
                onClick={() => handleHumanDecision(false)}
                disabled={isSubmitting}
                className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Request Revisions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
