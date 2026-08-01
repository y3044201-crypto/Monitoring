import React from 'react';
import { TrendingUp, FolderGit2, Activity, CheckCircle2, Percent } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  changePercent: string;
  isPositive?: boolean;
  type: 'total' | 'active' | 'completed' | 'progress';
  sparklineData: number[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  changePercent,
  isPositive = true,
  type,
  sparklineData,
}) => {
  let icon = <FolderGit2 className="w-6 h-6 text-blue-400" />;
  let iconBg = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  let glowColor = 'shadow-blue-900/20 hover:border-blue-500/40';

  if (type === 'active') {
    icon = <Activity className="w-6 h-6 text-cyan-400" />;
    iconBg = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    glowColor = 'shadow-cyan-900/20 hover:border-cyan-500/40';
  } else if (type === 'completed') {
    icon = <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
    iconBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    glowColor = 'shadow-emerald-900/20 hover:border-emerald-500/40';
  } else if (type === 'progress') {
    icon = <Percent className="w-6 h-6 text-purple-400" />;
    iconBg = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    glowColor = 'shadow-purple-900/20 hover:border-purple-500/40';
  }

  // Generate SVG sparkline path
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 100;
      const y = 30 - ((val - min) / range) * 24;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={`bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl transition-all duration-300 hover:scale-[1.01] ${glowColor} backdrop-blur-md flex flex-col justify-between`}>
      
      {/* Top Header: Icon & Percentage Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-2xl border ${iconBg} shadow-inner`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
          isPositive 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          <TrendingUp className="w-3 h-3" />
          <span>{changePercent}</span>
        </div>
      </div>

      {/* Metric Main Numbers */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">{value}</h3>
      </div>

      {/* Mini SVG Sparkline */}
      <div className="w-full h-8 pt-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              type === 'active'
                ? 'text-cyan-400'
                : type === 'completed'
                ? 'text-emerald-400'
                : type === 'progress'
                ? 'text-purple-400'
                : 'text-blue-400'
            }
            points={points}
          />
        </svg>
      </div>

    </div>
  );
};
