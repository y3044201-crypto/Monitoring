import React, { useState } from 'react';
import { AppsScriptConfig } from '../types';
import { 
  Search, 
  Bell, 
  RefreshCw, 
  Database, 
  Cloud, 
  Plus, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  X,
  SlidersHorizontal
} from 'lucide-react';

interface TopNavProps {
  activeTab?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  config: AppsScriptConfig;
  onOpenConfigModal: () => void;
  onOpenGuideModal: () => void;
  onOpenAddModal: () => void;
  isSyncing: boolean;
  onRefreshData: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab = 'dashboard',
  searchTerm,
  onSearchChange,
  config,
  onOpenConfigModal,
  onOpenGuideModal,
  onOpenAddModal,
  isSyncing,
  onRefreshData,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const isLive = config.mode === 'live' && config.webAppUrl.trim().length > 0;

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'monitoring':
        return 'Monitoring Network';
      case 'project':
        return 'Daftar Project';
      case 'volume':
        return 'PROGRES';
      case 'gis':
        return 'GIS Maps & Node Tracker';
      case 'asbuilt':
        return 'As Built Drawing';
      case 'boq':
        return 'BOQ & Material';
      case 'report':
        return 'Laporan & Analytics';
      case 'users':
        return 'User Management';
      case 'settings':
        return 'Pengaturan System';
      case 'loading':
        return 'Futuristic Loading Screen';
      default:
        return 'Dashboard';
    }
  };

  const sampleNotifications = [
    { id: 1, title: 'OTDR Alert Resolved', msg: 'Redaman Node Bandung Dago stabil pada 0.21 dB/km.', time: '10m lalu', type: 'success' },
    { id: 2, title: 'Baris Baru Database Central', msg: '12 item BOQ disinkronkan otomatis via Apps Script.', time: '1j lalu', type: 'info' },
    { id: 3, title: 'Warning Attenuation', msg: 'Node Surabaya East mengalami kenaikan trafik +18%.', time: '3j lalu', type: 'warning' },
  ];

  return (
    <header className="bg-[#0E1728]/90 backdrop-blur-md border-b border-[#1E293B]/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between gap-4 text-slate-200">
      
      {/* Left Title / Page Identifier */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-100 tracking-wide">
          {getPageTitle(activeTab)}
        </h1>
      </div>

      {/* Right Controls Group */}
      <div className="flex items-center gap-3">

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-[#101C2E] border border-white/5 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all relative"
            title="Notifikasi Sistem"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#101C2E] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" /> Notifikasi Network NOC
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 bg-[#08111F] border border-slate-800/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-[#0E1728] rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
              NOC
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0E1728] rounded-full"></span>
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1">
              Admin NOC
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Head Network Engineer</p>
          </div>
        </div>

      </div>

    </header>
  );
};
