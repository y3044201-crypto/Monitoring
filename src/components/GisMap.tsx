import React, { useState } from 'react';
import { FiberNode } from '../types';
import { INITIAL_NODES } from '../data/mockData';
import { 
  Map, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Activity, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Layers
} from 'lucide-react';

interface GisMapProps {
  nodes?: FiberNode[];
  onSelectNode?: (node: FiberNode) => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  nodes = INITIAL_NODES,
  onSelectNode,
}) => {
  const [selectedNode, setSelectedNode] = useState<FiberNode | null>(INITIAL_NODES[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleNodeClick = (node: FiberNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden h-full min-h-[420px]">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-2 z-10 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              <Map className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Interactive GIS Network Map</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Indonesia Fiber Backbone Ring & Core Routes</p>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-1 bg-[#08111F] p-1 border border-slate-800 rounded-xl">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#101C2E] rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#101C2E] rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#101C2E] rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Canvas Area */}
      <div 
        className="relative flex-1 bg-[#060D1A] rounded-2xl border border-slate-800/80 overflow-hidden min-h-[300px] flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Indonesia Islands Vector Stylized Outline */}
        <svg className="absolute inset-0 w-full h-full text-slate-800/20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Sumatra */}
          <path d="M 5,20 Q 15,35 25,50 T 28,60 L 22,55 Z" fill="currentColor" />
          {/* Java */}
          <path d="M 22,60 Q 40,65 60,70 L 58,74 Q 38,70 20,64 Z" fill="currentColor" />
          {/* Kalimantan */}
          <path d="M 50,25 Q 70,30 68,50 L 55,48 Z" fill="currentColor" />
          {/* Sulawesi */}
          <path d="M 72,35 Q 82,40 76,55 Z" fill="currentColor" />
        </svg>

        {/* SVG Fiber Lines Connecting Glowing Nodes */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="fiberGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="fiberGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Connected Fiber Lines */}
          <line x1="22%" y1="58%" x2="28%" y2="64%" stroke="url(#fiberGrad1)" strokeWidth="2.5" strokeDasharray="4 2" className="animate-pulse" />
          <line x1="28%" y1="64%" x2="55%" y2="68%" stroke="url(#fiberGrad1)" strokeWidth="2.5" />
          <line x1="55%" y1="68%" x2="68%" y2="74%" stroke="url(#fiberGrad2)" strokeWidth="2.5" />
          <line x1="68%" y1="74%" x2="62%" y2="42%" stroke="url(#fiberGrad1)" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="12%" y1="32%" x2="22%" y2="58%" stroke="#3B82F6" strokeWidth="2" />
        </svg>

        {/* Glowing Interactive Fiber Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          let nodeColor = 'bg-cyan-400 border-cyan-300 shadow-cyan-500/50';
          if (node.status === 'Warning') nodeColor = 'bg-amber-400 border-amber-300 shadow-amber-500/50';
          if (node.status === 'Critical') nodeColor = 'bg-rose-500 border-rose-400 shadow-rose-500/50';

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              {/* Pulse Ring */}
              <span className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                node.status === 'Warning' ? 'bg-amber-500' : 'bg-cyan-500'
              }`}></span>

              {/* Center Node Core */}
              <div className={`relative w-4 h-4 rounded-full border-2 shadow-lg transition-transform duration-200 group-hover:scale-125 ${nodeColor} ${
                isSelected ? 'ring-4 ring-cyan-500/40 scale-125' : ''
              }`}></div>

              {/* Label */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#0E1728]/90 border border-slate-700/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-200 whitespace-nowrap shadow-md pointer-events-none group-hover:border-cyan-400">
                {node.name.split(' ')[0]}
              </div>
            </div>
          );
        })}

        {/* Selected Node Detailed Overlay Card */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#0E1728]/95 border border-cyan-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedNode.name}</h4>
                  <p className="text-[10px] text-slate-400">{selectedNode.location} • {selectedNode.type}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                selectedNode.status === 'Online'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {selectedNode.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="bg-[#08111F] p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">OTDR Loss</span>
                <span className="font-bold text-cyan-400">{selectedNode.attenuationDb} dB/km</span>
              </div>
              <div className="bg-[#08111F] p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Active Cores</span>
                <span className="font-bold text-white">{selectedNode.activeCores}/{selectedNode.totalCores}</span>
              </div>
              <div className="bg-[#08111F] p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block">Capacity</span>
                <span className="font-bold text-purple-400">{selectedNode.bandwidthGbps} Gbps</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
