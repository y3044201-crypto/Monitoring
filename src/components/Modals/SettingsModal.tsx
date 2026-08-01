import React, { useState } from 'react';
import { AppsScriptConfig } from '../../types';
import { 
  Settings, 
  X, 
  Cloud, 
  Database, 
  Link2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Code2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppsScriptConfig;
  onSaveConfig: (newConfig: AppsScriptConfig) => void;
  onOpenGuide: () => void;
  onTestConnection: (url: string) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onOpenGuide,
  onTestConnection,
}) => {
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl);
  const [sheetName, setSheetName] = useState(config.sheetName || 'FiberTrack_Projects');
  const [mode, setMode] = useState<'simulated' | 'live'>(config.mode);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!webAppUrl) {
      setTestResult({ success: false, msg: 'Masukkan Web App URL terlebih dahulu.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const ok = await onTestConnection(webAppUrl);
    setIsTesting(false);
    if (ok) {
      setTestResult({ success: true, msg: 'Koneksi ke Apps Script Database Berhasil!' });
    } else {
      setTestResult({ success: false, msg: 'Gagal menghubungkan. Pastikan Web App URL di-deploy sebagai "Anyone".' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      webAppUrl: webAppUrl.trim(),
      sheetName: sheetName.trim() || 'FiberTrack_Projects',
      mode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101C2E] border border-cyan-500/30 rounded-[24px] max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Integrasi Database Central</h3>
              <p className="text-xs text-slate-400">Pengaturan Akses Apps Script Database Real-Time CRUD</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Mode Selector Toggle */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2">Mode Penyimpanan Data</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('simulated')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  mode === 'simulated'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-[#08111F] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Simulasi Local Sandbox</span>
                </div>
                <p className="text-[10px] opacity-80">Gunakan data lokal berkecepatan tinggi tanpa memerlukan API URL.</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('live')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  mode === 'live'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#08111F] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span>Database Live Central</span>
                </div>
                <p className="text-[10px] opacity-80">Sinkronkan secara langsung ke server database utama milik Anda.</p>
              </button>
            </div>
          </div>

          {/* Web App URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Apps Script Web App URL</label>
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Code2 className="w-3.5 h-3.5" /> Panduan & Kode Apps Script
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-[#08111F] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 outline-none font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Uji Koneksi</span>
              </button>
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{testResult.msg}</span>
            </div>
          )}

          {/* Sheet Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nama Sheet Tab Target</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="FiberTrack_Projects"
              className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
            >
              Simpan Pengaturan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
