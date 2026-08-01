import React, { useState } from 'react';
import { FiberProject } from '../types';
import { 
  FolderGit2, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ExternalLink
} from 'lucide-react';

interface ProjectsTableProps {
  projects: FiberProject[];
  onEdit: (project: FiberProject) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  searchTerm?: string;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onEdit,
  onDelete,
  onAddNew,
  searchTerm = '',
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: FiberProject['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case 'Planning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Planning
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" /> Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
      
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Project Rollout</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Daftar Proyek Penarikan Fiber Optik Trunk & Metro</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#08111F] p-1 border border-slate-800 rounded-xl text-xs">
            {['ALL', 'In Progress', 'Completed', 'Planning'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>

          <button
            onClick={onAddNew}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
            title="Tambah Proyek Fiber Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto no-scrollbar table-scroll-container">
        <table className="w-full text-left border-collapse text-xs table-auto">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-3 break-words whitespace-normal align-top">Project Name</th>
              <th className="py-3 px-3 break-words whitespace-normal align-top">Location</th>
              <th className="py-3 px-3 whitespace-nowrap align-top">Status</th>
              <th className="py-3 px-3 min-w-[120px] whitespace-nowrap align-top">Progress</th>
              <th className="py-3 px-3 whitespace-nowrap align-top">Due Date</th>
              <th className="py-3 px-2 text-right whitespace-nowrap align-top">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Tidak ada proyek fiber ditemukan.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-[#0E1728]/80 transition-colors group">
                  
                  {/* Project Name & ID */}
                  <td className="py-3.5 px-3 break-words whitespace-normal align-top">
                    <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors break-words">
                      {project.projectName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono break-words">{project.id} • {project.coresCount || 96} Cores</div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3 text-slate-300 break-words whitespace-normal align-top">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="break-words">{project.location}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getStatusBadge(project.status)}
                  </td>

                  {/* Progress Bar & Percentage */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 bg-[#08111F] rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.progress === 100
                              ? 'bg-emerald-400'
                              : project.progress > 60
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                              : 'bg-gradient-to-r from-amber-500 to-purple-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200 min-w-[32px] text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{project.dueDate}</span>
                    </div>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-2 text-right relative whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(project)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                        title="Edit Proyek"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(project.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
