import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
  let borderBg = 'bg-[#101C2E] border-emerald-500/40 text-slate-100 shadow-emerald-950/40';

  if (toast.type === 'error') {
    icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
    borderBg = 'bg-[#101C2E] border-rose-500/40 text-slate-100 shadow-rose-950/40';
  } else if (toast.type === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    borderBg = 'bg-[#101C2E] border-amber-500/40 text-slate-100 shadow-amber-950/40';
  } else if (toast.type === 'info') {
    icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    borderBg = 'bg-[#101C2E] border-cyan-500/40 text-slate-100 shadow-cyan-950/40';
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 relative ${borderBg}`}>
        {icon}
        <div className="flex-1 pr-4">
          <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
