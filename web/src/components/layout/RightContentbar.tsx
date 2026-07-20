'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { 
  Download, 
  Eye, 
  Code, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Sparkles, 
  Send, 
  Loader2,
  FileCode
} from 'lucide-react';

export default function RightContentbar() {
  const {
    status,
    finalOutput,
    pendingDraft,
    approveAgent,
    feedback,
    setFeedback,
    logs,
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Content to display: either final output or pending draft awaiting review
  const rawContent = finalOutput || pendingDraft || '';
  
  // Extract HTML portion from finalOutput if it has SUBJECT header
  const htmlContent = rawContent.replace(/^SUBJECT:.*\n+/i, '').trim();
  const subjectMatch = rawContent.match(/^SUBJECT:\s*(.*)/i);
  const subjectTitle = subjectMatch ? subjectMatch[1] : 'Your Weekly AI Agent Newsletter';

  // Handle Download HTML File action
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
    <div className="h-screen flex-1 bg-zinc-950 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Header Toolbar */}
      <div className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-950/90 backdrop-blur">
        {/* Left View Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-zinc-800 text-indigo-400 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Email Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'code'
                ? 'bg-zinc-800 text-indigo-400 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML Source</span>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {htmlContent && (
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs font-semibold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download HTML</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview / Code Canvas */}
      <div className="flex-1 p-6 overflow-y-auto bg-zinc-950/60 flex flex-col items-center justify-center">
        {htmlContent ? (
          activeTab === 'preview' ? (
            /* Rendered HTML Email Frame Mockup */
            <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
              {/* Email Header Metadata Bar */}
              <div className="bg-zinc-950 px-6 py-3 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-zinc-200">{subjectTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    HTML Format
                  </span>
                  {status === 'completed' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Sent (Simulated)
                    </span>
                  )}
                </div>
              </div>

              {/* Rendered HTML Container */}
              <div className="p-6 bg-white text-zinc-900 max-h-[680px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            </div>
          ) : (
            /* Raw HTML Code View */
            <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-xs text-zinc-300 overflow-x-auto my-auto max-h-[680px]">
              <pre className="whitespace-pre-wrap break-all">{htmlContent}</pre>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200 mb-1">No Newsletter Generated Yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your goal prompt in the middle panel and click <strong className="text-zinc-200">Run Newsletter Agent</strong> to trigger the automated workflow.
            </p>
          </div>
        )}
      </div>

      {/* Floating Human-in-the-Loop Review Banner */}
      {status === 'awaiting_human_review' && (
        <div className="absolute bottom-6 left-6 right-6 bg-zinc-900/95 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Banner Left Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <span>Human-in-the-Loop Review Required</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Review the draft above. Approve to dispatch or request specific revisions.
                </p>
              </div>
            </div>

            {/* Optional Revision Feedback Input */}
            <div className="w-full md:w-80">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional feedback for AI revision..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => handleHumanDecision(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Request Revisions</span>
              </button>

              <button
                onClick={() => handleHumanDecision(true)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Approve &amp; Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
