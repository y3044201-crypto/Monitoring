import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TRAFFIC_MONTHLY_DATA } from '../data/mockData';
import { Activity, ArrowDownRight, ArrowUpRight, Signal, Calendar } from 'lucide-react';

export const TrafficChart: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Jul 2026' | 'Jun 2026' | 'May 2026'>('Jul 2026');

  // Mini summary statistics
  const currentAvg = '4.8 Gbps';
  const totalIn = '12.4 TB';
  const totalOut = '8.9 TB';
  const packetLoss = '0.002%';

  return (
    <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
      
      {/* Header with Title & Monthly Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Traffic Overview</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Ring Backbone Bandwidth Throughput & Fiber Optic Load</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-[#08111F] border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-xl outline-none focus:border-cyan-500 cursor-pointer font-medium"
            >
              <option value="Jul 2026">Juli 2026 (Live)</option>
              <option value="Jun 2026">Juni 2026</option>
              <option value="May 2026">Mei 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="w-full h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={TRAFFIC_MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}G`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0E1728',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(value: any) => [`${value} Gbps`, 'Traffic Load']}
            />
            <Area
              type="monotone"
              dataKey="avgTrafficGbps"
              stroke="#22D3EE"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTraffic)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Mini Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 mt-2">
        <div className="bg-[#08111F]/80 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average Traffic</p>
          <p className="text-sm font-bold text-cyan-400 mt-0.5">{currentAvg}</p>
        </div>

        <div className="bg-[#08111F]/80 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" /> Total In
          </p>
          <p className="text-sm font-bold text-white mt-0.5">{totalIn}</p>
        </div>

        <div className="bg-[#08111F]/80 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-blue-400" /> Total Out
          </p>
          <p className="text-sm font-bold text-white mt-0.5">{totalOut}</p>
        </div>

        <div className="bg-[#08111F]/80 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Signal className="w-3 h-3 text-purple-400" /> Packet Loss
          </p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">{packetLoss}</p>
        </div>
      </div>

    </div>
  );
};
