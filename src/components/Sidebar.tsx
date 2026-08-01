import React from 'react';
import { NavTab } from '../types';
import { 
  FolderKanban, 
  Layers,
  Users2, 
  Settings, 
  Radio,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadLogsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, unreadLogsCount = 0 }) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'project', label: 'PROJECT', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'volume', label: 'PROGRES', icon: <Layers className="w-4 h-4" /> },
    { id: 'users', label: 'USER MANAGEMENT', icon: <Users2 className="w-4 h-4" /> },
    { id: 'settings', label: 'SETTINGS', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0E1728] border-r border-[#1E293B]/80 flex flex-col justify-between shrink-0 p-4 h-screen sticky top-0 overflow-hidden text-slate-300 select-none">
      
      {/* Top Header Logo & Brand */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-6 bg-[#101C2E] border border-white/5 rounded-2xl shadow-xl shadow-blue-950/20">
          <div className="relative p-2.5 bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#0E1728]"></span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
              FiberTrack
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">v3.2</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Network Management</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Navigasi Utama
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-lg shadow-blue-600/20 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-[#101C2E] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-cyan-400'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide uppercase">{item.label}</span>
                </div>

                {item.badge ? (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Futuristic Upgrade / System Card (Hidden) */}


    </aside>
  );
};
