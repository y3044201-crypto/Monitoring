import React, { useState, useEffect } from 'react';
import { NavTab, FiberProject, AppsScriptConfig, ToastMessage } from './types';
import { INITIAL_PROJECTS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { KpiCard } from './components/KpiCard';
import { TrafficChart } from './components/TrafficChart';
import { GisMap } from './components/GisMap';
import { ProjectsTable } from './components/ProjectsTable';
import { ProgressDonut } from './components/ProgressDonut';
import { ActivityFeed } from './components/ActivityFeed';
import { ProjectModal } from './components/Modals/ProjectModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AppsScriptGuideModal } from './components/Modals/AppsScriptGuideModal';
import { MonitoringView } from './components/Views/MonitoringView';
import { BoqView } from './components/Views/BoqView';
import { ProjectView } from './components/Views/ProjectView';
import { FuturisticLoadingScreen } from './components/FuturisticLoadingScreen';
import { Toast } from './components/Toast';
import { BackToTopButton } from './components/BackToTopButton';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('project');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Projects State
  const [projects, setProjects] = useState<FiberProject[]>(() => {
    const saved = localStorage.getItem('fibertrack_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  // Apps Script Configuration State
  const [config, setConfig] = useState<AppsScriptConfig>(() => {
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbwc67GBD0JtLexqRyEZqwTtH1hF7FKQGZWjHSl9d9LHGZMCrrJrKHPO1E-xbpdus0wmqg/exec';
    const saved = localStorage.getItem('fibertrack_appsscript_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.webAppUrl) return parsed;
    }
    return {
      webAppUrl: defaultUrl,
      sheetName: 'FiberTrack_Projects',
      mode: 'live',
    };
  });

  // Modals & UI Controls
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FiberProject | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Unified Loading Screen state for initial boot & ALL user activities/actions
  const [activeLoading, setActiveLoading] = useState<{
    title?: string;
    subtitle?: string;
    duration?: number;
  } | null>({
    title: 'SYSTEM BOOT',
    subtitle: 'INITIALIZING FIBERTRACK ENTERPRISE...',
    duration: 1800,
  });

  const triggerActionLoading = (
    actionFn?: () => void,
    title = 'PROCESSING',
    subtitle = 'PLEASE WAIT...',
    duration = 1200
  ) => {
    setActiveLoading({
      title,
      subtitle,
      duration,
    });
    if (actionFn) {
      actionFn();
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab === activeTab) return;
    triggerActionLoading(
      () => setActiveTab(tab),
      'NAVIGATING',
      `LOADING ${tab.toUpperCase()} MODULE...`,
      1100
    );
  };

  const handleRefreshData = () => {
    triggerActionLoading(
      () => fetchGoogleSheetsData(),
      'DATA SYNC',
      'SYNCING WITH DATABASE CENTRAL...',
      1800
    );
  };

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('fibertrack_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('fibertrack_appsscript_config', JSON.stringify(config));
  }, [config]);

  // Sync Data with Google Sheets (if Live)
  const fetchGoogleSheetsData = async () => {
    if (config.mode !== 'live' || !config.webAppUrl) return;
    try {
      const url = `${config.webAppUrl}?action=READ&sheet=${encodeURIComponent(config.sheetName)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        // Map Google Sheets rows to FiberProject format
        const fetchedProjects: FiberProject[] = json.data.map((row: any, idx: number) => ({
          id: row.ID || `PRJ-${idx + 100}`,
          projectName: row.ProjectName || 'Fiber Route Project',
          location: row.Location || 'Indonesia Corridor',
          status: row.Status || 'In Progress',
          progress: Number(row.Progress) || 50,
          dueDate: row.DueDate || '2026-12-31',
          contractor: row.Contractor || 'PT Fiber Contractor',
          budget: Number(row.Budget) || 10000000000,
          coresCount: Number(row.CoresCount) || 96,
        }));
        setProjects(fetchedProjects);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Database Central Synced',
          message: `${fetchedProjects.length} data proyek berhasil dimuat dari Database Central.`,
        });
      }
    } catch (err) {
      console.error('Apps Script Sync Error:', err);
      setToast({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Sync Notice',
        message: 'Menggunakan data lokal sandbox (Koneksi CORS Script Server dibatasi di preview).',
      });
    }
  };

  useEffect(() => {
    if (config.mode === 'live' && config.webAppUrl) {
      fetchGoogleSheetsData();
    }
  }, [config.mode, config.webAppUrl]);

  // Add / Edit Project handler
  const handleSaveProject = async (project: FiberProject) => {
    triggerActionLoading(
      async () => {
        if (editingProject) {
          setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? project : p)));
          setToast({
            id: Date.now().toString(),
            type: 'success',
            title: 'Proyek Diperbarui',
            message: `Proyek "${project.projectName}" berhasil diperbarui.`,
          });
        } else {
          setProjects((prev) => [project, ...prev]);
          setToast({
            id: Date.now().toString(),
            type: 'success',
            title: 'Proyek Baru Ditambahkan',
            message: `Proyek "${project.projectName}" berhasil dibuat.`,
          });
        }

        // Push to Google Sheets if Live Mode
        if (config.mode === 'live' && config.webAppUrl) {
          try {
            await fetch(config.webAppUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'CREATE',
                sheet: config.sheetName,
                item: project,
              }),
            });
          } catch (err) {
            console.warn('Post to Google Sheets error:', err);
          }
        }
      },
      'SAVING DATA',
      'WRITING PROJECT TO DATABASE...',
      1400
    );
  };

  // Delete Project handler
  const handleDeleteProject = async (id: string) => {
    triggerActionLoading(
      async () => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setToast({
          id: Date.now().toString(),
          type: 'info',
          title: 'Proyek Dihapus',
          message: `Proyek ID ${id} telah dihapus dari daftar.`,
        });

        if (config.mode === 'live' && config.webAppUrl) {
          try {
            await fetch(config.webAppUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'DELETE',
                sheet: config.sheetName,
                id,
              }),
            });
          } catch (err) {
            console.warn('Delete on Google Sheets error:', err);
          }
        }
      },
      'DELETING',
      'REMOVING PROJECT RECORD...',
      1200
    );
  };

  // Test Connection
  const handleTestConnection = async (url: string) => {
    try {
      const res = await fetch(`${url}?action=TEST`);
      const json = await res.json();
      return json && json.status === 'success';
    } catch (e) {
      return false;
    }
  };

  // KPI Calculated Metrics
  const totalProjectCount = projects.length;
  const activeProjectCount = projects.filter((p) => p.status === 'In Progress').length;
  const completedProjectCount = projects.filter((p) => p.status === 'Completed').length;
  const avgProgress = totalProjectCount > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjectCount)
    : 0;

  return (
    <div className="min-h-screen bg-[#08111F] text-slate-100 font-sans flex flex-col md:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Left Vertical Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Dashboard Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#08111F]">
        
        {/* Top Navigation */}
        <TopNav
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          config={config}
          onOpenConfigModal={() => setIsSettingsOpen(true)}
          onOpenGuideModal={() => setIsGuideOpen(true)}
          onOpenAddModal={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          isSyncing={activeLoading?.title === 'DATA SYNC'}
          onRefreshData={handleRefreshData}
        />

        {/* View Switching Canvas Container */}
        <main className="p-6 space-y-6 flex-1 max-w-[1920px] mx-auto w-full">
          
          {activeTab === 'monitoring' && <MonitoringView />}
          {activeTab === 'boq' && <BoqView onSyncGoogleSheets={handleRefreshData} />}
          {activeTab === 'gis' && <GisMap />}
          {activeTab === 'project' && <ProjectView />}
          {activeTab === 'volume' && (
            <ProjectView
              viewTitle="PROGRES"
              sheetUrl="https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI/edit?gid=722374604#gid=722374604"
              apiJsonUrl="/api/volume-sheet-json"
              apiCsvUrl="/api/volume-sheet"
              directExportUrl="https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI/export?format=csv&gid=722374604"
              storageKey="GOOGLE_VOLUME_SHEET_SCRIPT_URL"
              visibleColumns={['TANGGAL', 'PROJECT', 'SITE NAME', 'PIC SUPERVISI', 'KETERANGAN']}
              isReadOnly={true}
              hideFilters={true}
            />
          )}
          {activeTab === 'settings' && (
            <div className="bg-[#101C2E] border border-white/5 rounded-[24px] p-6 shadow-xl max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Pengaturan FiberTrack Enterprise</h3>
              <p className="text-xs text-slate-400 mb-6">Kelola koneksi Web App URL dan Apps Script Database.</p>
              
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Buka Panel Integrasi Database Central
              </button>
            </div>
          )}

          {activeTab === 'loading' && (
            <div className="w-full h-[80vh] min-h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
              <FuturisticLoadingScreen fullScreen={false} onClose={() => handleSelectTab('project')} />
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newCfg) => {
          triggerActionLoading(
            () => {
              setConfig(newCfg);
              setToast({
                id: Date.now().toString(),
                type: 'success',
                title: 'Pengaturan Disimpan',
                message: `Mode database diset ke: ${newCfg.mode === 'live' ? 'Database Live' : 'Simulasi Sandbox'}`,
              });
            },
            'SAVING CONFIG',
            'UPDATING DATABASE SETTINGS...',
            1200
          );
        }}
        onOpenGuide={() => {
          setIsSettingsOpen(false);
          setIsGuideOpen(true);
        }}
        onTestConnection={handleTestConnection}
      />

      <AppsScriptGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Unified Futuristic Loading Screen for All Activities & Actions (Displays ONCE per action with smooth 0->100% progress) */}
      {activeLoading && (
        <FuturisticLoadingScreen
          fullScreen={true}
          title={activeLoading.title}
          subtitle={activeLoading.subtitle}
          duration={activeLoading.duration}
          onClose={() => setActiveLoading(null)}
        />
      )}

      {/* Back To Top Floating Button */}
      <BackToTopButton />

    </div>
  );
}

export default App;
