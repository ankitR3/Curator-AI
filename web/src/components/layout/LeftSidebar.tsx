'use client';

import { useDashboardStore } from '@/src/store/useDashboardStore';
import { 
  Bot, 
  LayoutDashboard, 
  Sparkles, 
  History, 
  Settings, 
  HelpCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function LeftSidebar() {
  const { activeTab, setActiveTab } = useDashboardStore();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'agent', icon: Sparkles, label: 'Agent Hub' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="h-screen w-16 md:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between py-5 px-3 select-none">
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-semibold text-zinc-100 tracking-wide text-base">Curator AI</span>
            <span className="text-xs text-zinc-400">Newsletter Agent</span>
          </div>
        </div>

        {/* Server Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Connected to port 4000</span>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-zinc-800/80 text-indigo-400 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
        <button className="hidden md:flex items-center gap-3 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200">
          <HelpCircle className="w-4 h-4" />
          <span>Documentation</span>
        </button>

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-zinc-800">
            AI
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-medium text-zinc-200">AI Developer</span>
            <span className="text-[10px] text-zinc-500">Pro Account</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
