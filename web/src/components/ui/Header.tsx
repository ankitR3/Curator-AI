'use client';

import { Newspaper } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-14 w-full bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
          <Newspaper className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-200 tracking-tight text-sm">Newsletter Agent</span>
        </div>
      </div>
    </header>
  );
}
