'use client';

import { useEffect, useState } from 'react';
import Header from '@/src/components/ui/Header';
import LeftPanel from '@/src/components/layout/LeftPanel';
import RightPanel from '@/src/components/layout/RightPanel';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-screen w-screen bg-zinc-950" />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 font-sans text-zinc-100 antialiased overflow-hidden">
      {/* Top Header Navigation Bar */}
      <Header />

      {/* Main 2-Column Layout Container */}
      <main className="flex-1 flex gap-5 p-5 min-h-0 overflow-hidden bg-zinc-950">
        {/* Left Column: Goal Prompt, Mode Switch & Pipeline Steps */}
        <LeftPanel />

        {/* Right Column: Live Email Preview & HITL Review Banner */}
        <RightPanel />
      </main>
    </div>
  );
}
