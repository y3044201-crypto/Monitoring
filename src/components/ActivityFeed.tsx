import React from 'react';
import { ActivityItem } from '../types';
import { INITIAL_ACTIVITIES } from '../data/mockData';
import { 
  Activity, 
  Radio, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  User,
  Clock
} from 'lucide-react';

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = INITIAL_ACTIVITIES,
}) => {
  const getIcon = (type: ActivityItem['type'], status: ActivityItem['status']) => {
    switch (type) {
      case 'otdr_alert':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'fiber_splice':
        return <Activity className="w-3.5 h-3.5 text-blue-400" />;
      case 'boq_update':
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">Recent Network Activity</h3>
        </div>
        <p className="text-xs text-slate-400">Log Kejadian OTDR, Penyambungan Core & Sync Data</p>
      </div>

      {/* Timeline Feed */}
      <div className="relative space-y-4 my-3 pl-2 max-h-[320px] overflow-y-auto pr-1">
        {/* Timeline Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-800"></div>

        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3 group">
            
            {/* Timeline Circle Icon */}
            <div className="relative z-10 w-7 h-7 rounded-full bg-[#0E1728] border border-slate-700 flex items-center justify-center shrink-0 shadow-md group-hover:border-cyan-400 transition-colors">
              {getIcon(act.type, act.status)}
            </div>

            {/* Event Details */}
            <div className="flex-1 bg-[#08111F]/60 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {act.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mb-2">{act.description}</p>
              
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5 mt-1">
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <User className="w-3 h-3 text-cyan-500" /> {act.user}
                </span>
                <span className="font-mono">{act.id}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
