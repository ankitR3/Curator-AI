'use client';

import { Bot } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 w-full bg-zinc-950 border-b border-zinc-800/80 px-6 flex items-center justify-between select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-100 tracking-wide text-base">Curator AI</span>
        </div>
      </div>
    </header>
  );
}
