import React, { useState, useEffect } from 'react';
import { FiberProject } from '../../types';
import { X, Save, FolderPlus, Building2, MapPin, Calendar, DollarSign, Layers } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: FiberProject) => void;
  initialData?: FiberProject | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<FiberProject>>({
    id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
    projectName: '',
    location: '',
    status: 'In Progress',
    progress: 50,
    dueDate: new Date().toISOString().split('T')[0],
    contractor: '',
    budget: 15000000000,
    coresCount: 96,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        projectName: '',
        location: '',
        status: 'In Progress',
        progress: 10,
        dueDate: new Date().toISOString().split('T')[0],
        contractor: '',
        budget: 15000000000,
        coresCount: 96,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.location) return;
    onSave(formData as FiberProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101C2E] border border-cyan-500/30 rounded-[24px] max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Proyek Fiber Optik' : 'Tambah Proyek Fiber Baru'}
              </h3>
              <p className="text-xs text-slate-400">Data akan tersinkronisasi ke Database Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nama Proyek Penarikan Fiber *</label>
            <input
              type="text"
              required
              value={formData.projectName || ''}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="Contoh: Jakarta - Surabaya Backbone Trunk Phase 3"
              className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lokasi Koridor / Ring *</label>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: West Java Corridor"
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kontraktor Pelaksana</label>
              <input
                type="text"
                value={formData.contractor || ''}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                placeholder="PT Optik Indonesia"
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Status Proyek</label>
              <select
                value={formData.status || 'In Progress'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-cyan-500 outline-none font-medium"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Selesai</label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kapasitas Core Fiber</label>
              <select
                value={formData.coresCount || 96}
                onChange={(e) => setFormData({ ...formData, coresCount: Number(e.target.value) })}
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-cyan-500 outline-none font-mono"
              >
                <option value={24}>24 Cores</option>
                <option value={48}>48 Cores</option>
                <option value={96}>96 Cores</option>
                <option value={144}>144 Cores</option>
                <option value={288}>288 Cores (Subsea/Trunk)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Anggaran (IDR)</label>
              <input
                type="number"
                value={formData.budget || 0}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Proyek</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
