import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FiberProject } from '../types';
import { PieChart as PieIcon } from 'lucide-react';

interface ProgressDonutProps {
  projects: FiberProject[];
}

export const ProgressDonut: React.FC<ProgressDonutProps> = ({ projects }) => {
  // Count by status
  const counts = {
    Completed: projects.filter((p) => p.status === 'Completed').length,
    'In Progress': projects.filter((p) => p.status === 'In Progress').length,
    Planning: projects.filter((p) => p.status === 'Planning').length,
    Maintenance: projects.filter((p) => p.status === 'Maintenance').length,
  };

  const data = [
    { name: 'Completed', value: counts['Completed'], color: '#10B981' }, // Green
    { name: 'In Progress', value: counts['In Progress'], color: '#3B82F6' }, // Blue
    { name: 'Planning', value: counts['Planning'], color: '#7C3AED' }, // Purple
    { name: 'Maintenance', value: counts['Maintenance'], color: '#F59E0B' }, // Orange
  ];

  const totalProjects = projects.length;

  return (
    <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Project Status Distribution</h3>
        </div>
        <p className="text-xs text-slate-400">Ringkasan Tahapan Proyek Fiber Optik</p>
      </div>

      {/* Donut Chart with Center Stat Overlay */}
      <div className="relative w-full h-52 my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0E1728',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Overlay Stats */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-extrabold text-white font-mono">{totalProjects}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Proyek</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-[#08111F]/60 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-300 text-[11px] font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-white font-mono">{item.value}</span>
          </div>
        ))}
      </div>

    </div>
  );
};
