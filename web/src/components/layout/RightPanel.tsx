'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { 
  Download, 
  CheckCircle, 
  X, 
  Mail, 
  Newspaper, 
  Send, 
  Loader2,
  Code,
  Eye,
  RefreshCw,
  Edit3
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
  let htmlContent = rawContent.replace(/^SUBJECT:[^\n]*\n*/i, '').trim();
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

  const handleHumanDecision = async (approve: boolean, customFeedback?: string) => {
    setIsSubmitting(true);
    if (customFeedback !== undefined) {
      setFeedback(customFeedback);
    }
    await approveAgent(approve);
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 min-w-0 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex flex-col justify-between overflow-hidden relative select-none">
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
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
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800/80 rounded-lg shadow-xl overflow-hidden my-auto text-zinc-100">
              {/* Rendered HTML view */}
              <div className="p-8 bg-zinc-950 text-zinc-100 max-h-[580px] overflow-y-auto email-preview-content">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: htmlContent
                      .replace(/background-color\s*:\s*([^;"}]+)/gi, 'background-color: transparent')
                      .replace(/background\s*:\s*(#ffffff|#fff|white)/gi, 'background: transparent')
                      .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*\*/g, '')
                  }} 
                />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-md p-4 font-mono text-xs text-zinc-300 overflow-x-auto my-auto max-h-[580px]">
              <pre className="whitespace-pre-wrap break-all">{htmlContent}</pre>
            </div>
          )
        ) : status === 'running' ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-12 h-12 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 mb-3">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Generating Newsletter Draft...</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Please wait while the AI Agent researches news &amp; builds your newsletter.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="w-12 h-12 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">No Email Draft Generated</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enter your goal prompt in the left panel and click <strong className="text-zinc-300">Run Newsletter Agent</strong> to preview the output.
            </p>
          </div>
        )}
      </div>

      {/* Human-in-the-Loop Review Banner */}
      {status === 'awaiting_human_review' && (
        <div className="m-4 bg-zinc-950 border border-zinc-800 rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
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
              placeholder="Type custom revision instructions (optional for AI auto-review)..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none focus:border-zinc-700"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Approve & Dispatch */}
              <button
                type="button"
                onClick={() => handleHumanDecision(true)}
                disabled={isSubmitting}
                className="py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Approve &amp; Dispatch</span>
              </button>

              {/* Option 2: AI Auto-Revise (AI Self-Critique) */}
              <button
                type="button"
                onClick={() => handleHumanDecision(false, '')}
                disabled={isSubmitting}
                title="AI Auto-Revise: The AI Editor automatically evaluates the draft and rewrites it without requiring manual feedback."
                className="py-2 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Auto-Revise</span>
              </button>

              {/* Option 3: Custom Revise (User Written Feedback) */}
              <button
                type="button"
                onClick={() => handleHumanDecision(false)}
                disabled={isSubmitting || !feedback.trim()}
                title={!feedback.trim() ? "Type custom instructions above first to enable" : "Custom Revise: Rewrites the newsletter using the instructions you typed above."}
                className="py-2 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Custom Revise</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
