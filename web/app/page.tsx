'use client';

import Header from '@/src/components/ui/Header';
import LeftPanel from '@/src/components/layout/LeftPanel';
import RightPanel from '@/src/components/layout/RightPanel';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 font-sans text-zinc-100 antialiased overflow-hidden">
      {/* Top Header Navigation Bar */}
      <Header />

      {/* Main 2-Column Layout Container */}
      <main className="flex-1 flex gap-5 p-5 min-h-0 overflow-hidden">
        {/* Left Column: Goal Prompt, Mode Switch, Pipeline Steps & Logs */}
        <LeftPanel />

        {/* Right Column: Live Email Preview, Source Code & HITL Banner */}
        <RightPanel />
      </main>
    </div>
  );
}
