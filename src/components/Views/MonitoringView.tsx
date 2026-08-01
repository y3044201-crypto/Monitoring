import React, { useState } from 'react';
import { FiberNode } from '../../types';
import { INITIAL_NODES } from '../../data/mockData';
import { 
  Activity, 
  Radio, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Sliders,
  Cpu,
  BarChart2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const MonitoringView: React.FC = () => {
  const [nodes, setNodes] = useState<FiberNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<FiberNode>(INITIAL_NODES[0]);

  // Simulated OTDR Signal Trace Data for selected node
  const otdrTraceData = [
    { distanceKm: 0, lossDb: 0 },
    { distanceKm: 10, lossDb: -2.1 },
    { distanceKm: 25, lossDb: -5.4 },
    { distanceKm: 25.1, lossDb: -6.8 }, // Joint Box Splice Event
    { distanceKm: 40, lossDb: -9.2 },
    { distanceKm: 65, lossDb: -14.5 },
    { distanceKm: 80, lossDb: -18.2 },
    { distanceKm: 100, lossDb: -22.8 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#101C2E] via-[#14243B] to-[#0E1728] border border-cyan-500/20 rounded-[24px] p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">OTDR Real-Time Fiber Monitoring</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Sistem pengawasan redaman serat optik (Optical Time-Domain Reflectometer) secara terus-menerus untuk memantau kelayakan sambungan core dan deteksi dini fiber cut.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-[#08111F] px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Status OTDR Sensor</div>
              <div className="text-xs font-bold text-emerald-400">All 6 Nodes Normal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Node Selection List, Right OTDR Trace & Detailed Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Node Cards List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Daftar POP & Hub Optik</h3>
          {nodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#101C2E] to-[#17253D] border-cyan-500/50 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-[#101C2E]/70 border-white/5 hover:border-slate-700 hover:bg-[#101C2E]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                      <Zap className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-bold text-white">{node.name}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    node.status === 'Online'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <span>Loss:</span> <strong className="text-cyan-300 font-mono">{node.attenuationDb} dB</strong>
                  </div>
                  <div>
                    <span>Cores:</span> <strong className="text-white font-mono">{node.activeCores}/{node.totalCores}</strong>
                  </div>
                  <div>
                    <span>Speed:</span> <strong className="text-purple-300 font-mono">{node.bandwidthGbps}G</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: OTDR Curve & Telemetry Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* OTDR Signal Curve Chart */}
          <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Kurva Sinyal OTDR - {selectedNode.name}</h3>
                <p className="text-xs text-slate-400">Reflektometri Sinyal Cahaya Sepanjang Jarum Serat Optik ({selectedNode.location})</p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
                1550nm Laser Pulse
              </span>
            </div>

            <div className="w-full h-64 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={otdrTraceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="distanceKm" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} km`} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v} dB`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1728',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} dB`, 'Redaman Optik']}
                    labelFormatter={(lbl: any) => `Jarak: ${lbl} km`}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="lossDb"
                    stroke="#22D3EE"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-[#08111F] rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Status Kualitas Core #1 - #96: <b>Lolos Ambang Batas ITU-T G.652.D</b></span>
              <span className="text-emerald-400 font-bold font-mono">Loss Rate: 0.21 dB/km</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
