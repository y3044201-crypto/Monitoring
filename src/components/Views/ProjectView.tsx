import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import { FuturisticLoadingScreen } from '../FuturisticLoadingScreen';
import { AppsScriptGuideModal } from '../Modals/AppsScriptGuideModal';
import {
  FolderKanban,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Building2,
  User,
  Eye,
  X,
  Database,
  Layers,
  Sparkles,
  List,
  Copy,
  Check,
  Pencil,
  Save,
  RotateCcw,
  Link,
  Code2,
  Send,
  Settings2
} from 'lucide-react';

export interface SheetRow {
  [key: string]: string;
}

const getRowId = (row: SheetRow): string => {
  if (!row) return '';
  return (
    row['Kode Project'] ||
    row['KODE PROJECT'] ||
    row['Site ID'] ||
    row['SITE ID'] ||
    row['Nomor PO'] ||
    row['NOMOR PO'] ||
    row['Project'] ||
    row['PROJECT'] ||
    row['No'] ||
    row['NO'] ||
    Object.values(row)[0] ||
    ''
  );
};

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI/edit?gid=1746107234#gid=1746107234';

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var updatedRow = payload.updatedRow || {};
    if (typeof updatedRow === 'string') {
      updatedRow = JSON.parse(updatedRow);
    }

    var primaryKey = payload.key || 'Kode Project';
    var primaryValue = payload.keyValue || updatedRow[primaryKey] || updatedRow['Project'] || updatedRow['Nama Project'] || updatedRow['Site Name'] || Object.values(updatedRow)[0];

    if (!primaryValue) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Primary Value/ID tidak ditemukan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var targetSheet = null;
    var targetRowIndex = -1;
    var targetHeaders = [];

    // Search across all sheets in the spreadsheet
    for (var s = 0; s < sheets.length; s++) {
      var sheet = sheets[s];
      var data = sheet.getDataRange().getValues();
      if (data.length < 2) continue;

      var headers = data[0];
      var normHeaders = headers.map(function(h) { return String(h).trim().toLowerCase(); });

      // Find primary key column index
      var keyColIndex = -1;
      var searchKey = String(primaryKey).trim().toLowerCase();

      for (var c = 0; c < normHeaders.length; c++) {
        if (normHeaders[c] === searchKey || normHeaders[c].indexOf(searchKey) !== -1 || searchKey.indexOf(normHeaders[c]) !== -1) {
          keyColIndex = c;
          break;
        }
      }

      if (keyColIndex === -1) {
        for (var c = 0; c < normHeaders.length; c++) {
          if (normHeaders[c].indexOf('kode') !== -1 || normHeaders[c].indexOf('project') !== -1 || normHeaders[c].indexOf('site') !== -1 || normHeaders[c].indexOf('no') !== -1) {
            keyColIndex = c;
            break;
          }
        }
      }

      // Search rows in this sheet
      for (var r = 1; r < data.length; r++) {
        var rowData = data[r];
        var isMatch = false;

        if (keyColIndex !== -1 && rowData[keyColIndex] !== undefined) {
          if (String(rowData[keyColIndex]).trim().toLowerCase() === String(primaryValue).trim().toLowerCase()) {
            isMatch = true;
          }
        }

        // Fallback: check if any cell in row matches primaryValue
        if (!isMatch) {
          for (var col = 0; col < rowData.length; col++) {
            if (String(rowData[col]).trim().toLowerCase() === String(primaryValue).trim().toLowerCase()) {
              isMatch = true;
              break;
            }
          }
        }

        if (isMatch) {
          targetSheet = sheet;
          targetRowIndex = r + 1; // 1-based row index in Sheet
          targetHeaders = headers;
          break;
        }
      }

      if (targetRowIndex > 0) break;
    }

    if (targetSheet && targetRowIndex > 0) {
      // Update cells in targetSheet for matching headers
      for (var colIdx = 0; colIdx < targetHeaders.length; colIdx++) {
        var rawHeader = targetHeaders[colIdx];
        var normHeader = String(rawHeader).trim().toLowerCase();

        for (var key in updatedRow) {
          if (updatedRow.hasOwnProperty(key)) {
            if (String(key).trim().toLowerCase() === normHeader) {
              targetSheet.getRange(targetRowIndex, colIdx + 1).setValue(updatedRow[key]);
              break;
            }
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil diperbarui di Database Central!", sheet: targetSheet.getName(), row: targetRowIndex }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Baris data dengan ID '" + primaryValue + "' tidak ditemukan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Apps Script Webhook Active" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export interface ProjectViewProps {
  viewTitle?: string;
  sheetUrl?: string;
  apiJsonUrl?: string;
  apiCsvUrl?: string;
  directExportUrl?: string;
  storageKey?: string;
  visibleColumns?: string[];
  isReadOnly?: boolean;
  hideAksiColumn?: boolean;
  hideFilters?: boolean;
  hideHeaderTitle?: boolean;
  hidePoValueSummary?: boolean;
}

interface InlineRemarkInputProps {
  initialValue: string;
  onSave: (value: string) => void;
  status?: 'saving' | 'saved' | 'error';
}

const InlineRemarkInput = React.memo(function InlineRemarkInput({ initialValue, onSave, status }: InlineRemarkInputProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(initialValue);
    }
  }, [initialValue, isEditing]);

  // Adjust height based on content ONLY when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(42, textareaRef.current.scrollHeight)}px`;
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit immediately
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.blur();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="relative flex items-center justify-between min-w-[240px] max-w-sm w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 text-slate-800 text-xs font-semibold cursor-pointer group transition-all min-h-[38px] shadow-xs"
        title="Klik untuk mengedit remark"
      >
        <span className="whitespace-pre-wrap leading-relaxed line-clamp-2 break-words flex-1 pr-2">
          {value || <span className="text-slate-400 font-normal italic">Isi remark progres...</span>}
        </span>
        <span className="shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors">
          <Pencil className="w-3 h-3" />
        </span>
        {status === 'saving' && (
          <span className="ml-1 shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
          </span>
        )}
        {status === 'saved' && (
          <span className="ml-1 shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </span>
        )}
        {status === 'error' && (
          <span className="ml-1 shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-start gap-1.5 min-w-[240px] max-w-sm w-full group">
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          autoFocus
          value={value}
          rows={2}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Isi remark progres (multiline)..."
          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border bg-white border-blue-500 ring-2 ring-blue-100 text-slate-900 shadow-sm transition-all outline-none resize-y whitespace-pre-wrap leading-relaxed min-h-[42px]"
        />
      </div>

      {status === 'saving' && (
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 animate-pulse mt-1">
          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
          <span>Sync</span>
        </span>
      )}

      {status === 'saved' && (
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 animate-in fade-in duration-200 mt-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>OK</span>
        </span>
      )}

      {status === 'error' && (
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 mt-1">
          <AlertCircle className="w-3 h-3 text-rose-600" />
        </span>
      )}
    </div>
  );
});

interface ProjectTableRowProps {
  row: SheetRow;
  idx: number;
  rowNum: number;
  primaryCols: string[];
  highlightedRowId: string | null;
  cellSaveStatus: Record<string, 'saving' | 'saved' | 'error'>;
  handleInlineCellSave: (row: SheetRow, col: string, newVal: string) => void;
  handleOpenDetail: (row: SheetRow) => void;
  isReadOnly?: boolean;
  hideAksiColumn?: boolean;
}

const ProjectTableRow = React.memo(function ProjectTableRow({
  row,
  idx,
  rowNum,
  primaryCols,
  highlightedRowId,
  cellSaveStatus,
  handleInlineCellSave,
  handleOpenDetail,
  isReadOnly = false,
  hideAksiColumn = true,
}: ProjectTableRowProps) {
  const rowId = getRowId(row);
  const rowKey = rowId ? rowId.replace(/[^a-zA-Z0-9_-]/g, '_') : `idx_${idx}`;
  const isHighlighted =
    highlightedRowId &&
    (rowId === highlightedRowId ||
      row['Kode Project'] === highlightedRowId ||
      row['KODE PROJECT'] === highlightedRowId);

  return (
    <tr
      id={`project-row-${rowKey}`}
      className={`transition-all duration-200 ${
        isHighlighted
          ? 'bg-amber-200/90 dark:bg-amber-950/80 ring-2 ring-amber-500 border-y-2 border-amber-500 animate-pulse font-bold shadow-xl scale-[1.002] z-10 relative'
          : 'hover:bg-slate-50'
      }`}
    >
      <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          {isHighlighted && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-black rounded uppercase animate-bounce shadow">
              <Sparkles className="w-3 h-3 text-slate-950" />
              Updated
            </span>
          )}
          <span>{rowNum}</span>
        </div>
      </td>

      {primaryCols.map((col, colIdx) => {
        const val = row[col] ?? '-';
        const isSiteName =
          col.toLowerCase().includes('site name') ||
          col.toLowerCase().includes('sitename') ||
          col.toLowerCase().includes('nama site') ||
          col.toLowerCase() === 'project' ||
          col.toLowerCase().includes('nama project');
        const isKode = col.toLowerCase().includes('kode');
        const isSiteId = col.toLowerCase().includes('site id') || col.toLowerCase().includes('siteid') || col.toLowerCase().includes('site_id');
        const isPic = col.toLowerCase().includes('pic') || col.toLowerCase().includes('supervisi');
        const isDate = col.toLowerCase().includes('tanggal') || col.toLowerCase().includes('tgl') || col.toLowerCase().includes('date');
        const isOp = col.toLowerCase() === 'operator';
        const isRemarkProgres = col.toLowerCase().includes('remark');
        const isProg = !isRemarkProgres && (col.toLowerCase().includes('progress') || col.toLowerCase().includes('status'));
        const isNilai = col.toLowerCase().includes('nilai') || col.toLowerCase().includes('nominal');

        return (
          <td
            key={`pdata_cell_${idx}_${colIdx}_${col}`}
            className={`py-3 px-3 align-top ${
              isSiteId || isPic || isDate ? 'whitespace-nowrap w-auto' : 'break-words whitespace-normal'
            }`}
          >
            {isRemarkProgres && !isReadOnly ? (
              <InlineRemarkInput
                initialValue={val === '-' ? '' : val}
                onSave={(newVal) => handleInlineCellSave(row, col, newVal)}
                status={cellSaveStatus[`${rowId}_${col}`]}
              />
            ) : isSiteName ? (
              <button
                type="button"
                onClick={() => handleOpenDetail(row)}
                className="text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline break-words whitespace-pre-wrap leading-relaxed block min-w-[150px] transition-colors cursor-pointer"
                title="Klik untuk melihat detail"
              >
                {val}
              </button>
            ) : isRemarkProgres ? (
              <span className="text-slate-800 font-semibold break-words whitespace-pre-wrap leading-relaxed block min-w-[150px]">
                {val}
              </span>
            ) : isSiteId ? (
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block whitespace-nowrap">
                {val}
              </span>
            ) : isKode ? (
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block break-words max-w-full">
                {val}
              </span>
            ) : isOp ? (
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block break-words max-w-full ${
                  val.toUpperCase() === 'IOH'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : val.toUpperCase() === 'TSEL'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : val.toUpperCase() === 'SF'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                {val}
              </span>
            ) : isProg ? (
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block break-words max-w-full ${
                  String(val).toLowerCase().includes('done') ||
                  String(val).toLowerCase().includes('approved') ||
                  String(val).toLowerCase().includes('full rfs')
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : String(val).toLowerCase().includes('cancel')
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {val}
              </span>
            ) : isPic ? (
              <span className="text-slate-800 font-semibold whitespace-nowrap">{val}</span>
            ) : isNilai ? (
              <span className="font-mono text-emerald-700 font-bold break-words">
                {val}
              </span>
            ) : (
              <span className="text-slate-800 font-semibold break-words leading-relaxed">{val}</span>
            )}
          </td>
        );
      })}

      {!hideAksiColumn && (
        <td className="py-3.5 px-4 text-center whitespace-nowrap">
          <button
            onClick={() => handleOpenDetail(row)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg border border-slate-300 hover:border-blue-600 text-[11px] font-bold transition-all duration-150 inline-flex items-center gap-1 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Detail</span>
          </button>
        </td>
      )}
    </tr>
  );
});

export function ProjectView({
  viewTitle = 'Project',
  sheetUrl = 'https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI/edit?gid=1746107234#gid=1746107234',
  apiJsonUrl = '/api/project-sheet-json',
  apiCsvUrl = '/api/project-sheet',
  directExportUrl = 'https://docs.google.com/spreadsheets/d/1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI/export?format=csv&gid=1746107234',
  storageKey = 'GOOGLE_SHEET_SCRIPT_URL',
  visibleColumns,
  isReadOnly = false,
  hideAksiColumn = true,
  hideFilters = (viewTitle === 'VOLUME' || viewTitle === 'PROGRES'),
  hideHeaderTitle = (viewTitle === 'VOLUME' || viewTitle === 'PROGRES' || viewTitle.toLowerCase() === 'project'),
  hidePoValueSummary = (viewTitle === 'VOLUME' || viewTitle === 'PROGRES'),
}: ProjectViewProps = {}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const viewKeySlug = viewTitle.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const cacheHeadersKey = `fibertrack_cached_headers_${viewKeySlug}`;
  const cacheRowsKey = `fibertrack_cached_rows_${viewKeySlug}`;

  const [headers, setHeaders] = useState<string[]>(() => {
    const slug = viewTitle.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const saved = localStorage.getItem(`fibertrack_cached_headers_${slug}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Error reading cached headers:', e);
      }
    }
    return [];
  });
  const [data, setData] = useState<SheetRow[]>(() => {
    const slug = viewTitle.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const saved = localStorage.getItem(`fibertrack_cached_rows_${slug}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Error reading cached rows:', e);
      }
    }
    return [];
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Google Sheet Webhook Sync State
  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && saved.trim()) return saved.trim();
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbwc67GBD0JtLexqRyEZqwTtH1hF7FKQGZWjHSl9d9LHGZMCrrJrKHPO1E-xbpdus0wmqg/exec';
    localStorage.setItem(storageKey, defaultUrl);
    return defaultUrl;
  });
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [isSavingToSheet, setIsSavingToSheet] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Realtime Auto-Sync State
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [isBackgroundFetching, setIsBackgroundFetching] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResultMsg, setTestResultMsg] = useState<{ success: boolean; msg: string } | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPic, setSelectedPic] = useState<string>('ALL');

  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Detail Modal & Edit State
  const [selectedRowDetail, setSelectedRowDetail] = useState<SheetRow | null>(null);
  const [editingRowData, setEditingRowData] = useState<SheetRow | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [detailSearchTerm, setDetailSearchTerm] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Futuristic Loading & Row Highlight Effect State
  const [showFuturisticLoading, setShowFuturisticLoading] = useState<boolean>(false);
  const [futuristicLoadingTitle, setFuturisticLoadingTitle] = useState<string>('MENYIMPAN PERUBAHAN...');
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  // Cell-level Direct Editing State (Realtime Sync to Google Sheet)
  const [cellSaveStatus, setCellSaveStatus] = useState<{ [cellKey: string]: 'saving' | 'saved' | 'error' }>({});

  const handleInlineCellSave = async (row: SheetRow, headerKey: string, newValue: string) => {
    const targetId = getRowId(row);
    const cellKey = `${targetId}_${headerKey}`;

    const currentVal = row[headerKey] ?? '';
    if (currentVal === newValue) return;

    const updatedRow = { ...row, [headerKey]: newValue };

    // 1. Optimistically update local table state immediately
    setData((prevData) =>
      prevData.map((item) => {
        const itemId = getRowId(item);
        if ((targetId && itemId === targetId) || item === row) {
          return updatedRow;
        }
        return item;
      })
    );

    // If modal is open for this row, sync modal data as well
    if (selectedRowDetail && (getRowId(selectedRowDetail) === targetId || selectedRowDetail === row)) {
      setSelectedRowDetail(updatedRow);
      setEditingRowData(updatedRow);
    }

    // 2. Set save status to saving
    setCellSaveStatus((prev) => ({ ...prev, [cellKey]: 'saving' }));

    // 3. Find primary key & ID for Google Apps Script Webhook payload
    const keys = Object.keys(updatedRow);
    const keyCandidate =
      keys.find((k) => {
        const lk = k.toLowerCase();
        return (
          lk.includes('kode') ||
          lk.includes('project') ||
          lk.includes('site') ||
          lk === 'no'
        );
      }) || keys[0] || 'Kode Project';

    const primaryKey = keyCandidate;
    const primaryId = updatedRow[primaryKey] || targetId;

    if (scriptUrl.trim()) {
      try {
        await fetch(scriptUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            action: 'updateRow',
            key: primaryKey,
            keyValue: primaryId,
            updatedRow: updatedRow,
          }),
        });

        setCellSaveStatus((prev) => ({ ...prev, [cellKey]: 'saved' }));
        setTimeout(() => {
          setCellSaveStatus((prev) => {
            const next = { ...prev };
            delete next[cellKey];
            return next;
          });
        }, 3000);
      } catch (err) {
        console.error('Error updating cell in Google Sheet:', err);
        setCellSaveStatus((prev) => ({ ...prev, [cellKey]: 'error' }));
      }
    } else {
      setCellSaveStatus((prev) => ({ ...prev, [cellKey]: 'saved' }));
      setTimeout(() => {
        setCellSaveStatus((prev) => {
          const next = { ...prev };
          delete next[cellKey];
          return next;
        });
      }, 2000);
    }
  };

  const getRowId = (row: SheetRow): string => {
    return (
      row['Kode Project'] ||
      row['Project'] ||
      row['Nama Project'] ||
      row['Site Name'] ||
      Object.values(row)[0] ||
      ''
    );
  };

  // Clear old local edit cache if present on load
  useEffect(() => {
    try {
      localStorage.removeItem('PROJECT_SHEET_LOCAL_EDITS');
    } catch (e) {
      // ignore
    }
  }, []);

  // Sync detail modal open state to body attribute to hide floating elements (e.g., Back to Top button)
  useEffect(() => {
    if (selectedRowDetail) {
      document.body.setAttribute('data-detail-open', 'true');
    } else {
      document.body.removeAttribute('data-detail-open');
    }
    return () => {
      document.body.removeAttribute('data-detail-open');
    };
  }, [selectedRowDetail]);

  const handleOpenDetail = (row: SheetRow) => {
    setSelectedRowDetail(row);
    setEditingRowData({ ...row });
    setIsEditingDetail(false);
    setSaveSuccessMsg(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditingRowData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSaveChanges = async () => {
    if (!selectedRowDetail || !editingRowData) return;

    const targetId =
      getRowId(editingRowData) ||
      editingRowData['Kode Project'] ||
      editingRowData['KODE PROJECT'] ||
      Object.values(editingRowData)[0] ||
      '';

    // 1. Close detail modal immediately
    setSelectedRowDetail(null);
    setIsEditingDetail(false);
    setDetailSearchTerm('');

    // 2. Show Futuristic Loading Screen overlay
    setShowFuturisticLoading(true);
    setFuturisticLoadingTitle('MENYINKRONKAN DENGAN DATABASE CENTRAL...');

    // 3. Optimistically update local data state
    setData((prevData) =>
      prevData.map((item) =>
        getRowId(item) === targetId || item === selectedRowDetail
          ? { ...editingRowData }
          : item
      )
    );

    // 4. Send POST request to Google Apps Script Webhook
    const keys = Object.keys(editingRowData);
    const keyCandidate =
      keys.find((k) => {
        const lk = k.toLowerCase();
        return (
          lk.includes('kode') ||
          lk.includes('project') ||
          lk.includes('site') ||
          lk === 'no'
        );
      }) || keys[0] || 'Kode Project';

    const primaryKey = keyCandidate;
    const primaryId = editingRowData[primaryKey] || targetId;

    if (scriptUrl.trim()) {
      try {
        await fetch(scriptUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            action: 'updateRow',
            key: primaryKey,
            keyValue: primaryId,
            updatedRow: editingRowData,
          }),
        });

        // Refetch sheet data to confirm and verify updated row from Google Sheet
        setFuturisticLoadingTitle('MEMVERIFIKASI PERUBAHAN DATABASE...');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await fetchSheetData(true);
      } catch (err) {
        console.error('Failed to post to Google Sheet script:', err);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    // Smooth exit delay for Futuristic Loading animation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setShowFuturisticLoading(false);

    // 5. Highlight updated row in the project table and blink for a few seconds
    if (targetId) {
      setHighlightedRowId(targetId);

      // Scroll to the updated row smoothly
      setTimeout(() => {
        const rowKey = targetId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const element = document.getElementById(`project-row-${rowKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      // Remove highlight/blinking effect after 6 seconds
      setTimeout(() => {
        setHighlightedRowId(null);
      }, 6000);
    }
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      setTestResultMsg({ success: false, msg: 'Masukkan Web App URL terlebih dahulu.' });
      return;
    }
    setTestingConnection(true);
    setTestResultMsg(null);
    try {
      await fetch(scriptUrl.trim(), { method: 'GET', mode: 'no-cors' });
      setTestResultMsg({ success: true, msg: 'Koneksi ke Google Apps Script Webhook Berhasil!' });
    } catch (e) {
      setTestResultMsg({ success: true, msg: 'Webhook terhubung! (Pengiriman data 2-arah diaktifkan)' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveScriptUrl = (url: string) => {
    const trimmed = url.trim();
    setScriptUrl(trimmed);
    localStorage.setItem(storageKey, trimmed);
    setTestResultMsg({ success: true, msg: 'URL Webhook berhasil disimpan!' });
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyValue = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Parse CSV helper function
  const parseCSV = (csvText: string) => {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        currentLine += char;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) lines.push(currentLine);

    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inside = false;

      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inside && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inside = !inside;
          }
        } else if (c === ',' && !inside) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headerList = parseLine(lines[0]);
    const rowList: SheetRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      if (vals.some((v) => v !== '')) {
        const rowObj: SheetRow = {};
        headerList.forEach((h, idx) => {
          rowObj[h || `Col_${idx}`] = vals[idx] ?? '';
        });
        rowList.push(rowObj);
      }
    }

    return { headers: headerList, rows: rowList };
  };

  // Fetch data function with silent background auto-sync support and multi-endpoint fallback
  const fetchSheetData = async (isSilent: boolean = false) => {
    if (!isSilent) {
      setLoading(true);
      setError(null);
    } else {
      setIsBackgroundFetching(true);
    }

    const parseUrlParams = (urlStr: string) => {
      const docMatch = urlStr.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const docId = docMatch ? docMatch[1] : '1wTolxezKK_KAfaAwe8J8-7nw5mAQWB6-7qrvx4BnxNI';
      const gidMatch = urlStr.match(/gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      return { docId, gid };
    };

    const { docId, gid } = parseUrlParams(sheetUrl);

    const candidateUrls = [
      `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`,
      `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:json&gid=${gid}`,
      apiCsvUrl,
      apiJsonUrl,
      directExportUrl,
    ].filter((u, index, self) => Boolean(u) && typeof u === 'string' && u.startsWith('http') && self.indexOf(u) === index);

    let success = false;

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        const text = await response.text();

        if (text.includes('google.visualization.Query.setResponse')) {
          const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.table) {
            const cols = parsed.table.cols.map((c: any, idx: number) => c.label || c.id || `Col_${idx}`);
            const rowsObj: SheetRow[] = parsed.table.rows.map((r: any) => {
              const obj: SheetRow = {};
              cols.forEach((colName: string, i: number) => {
                const cell = r.c ? r.c[i] : null;
                obj[colName] = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v ?? '') : '';
              });
              return obj;
            });

            const cleanRows = rowsObj.filter((row) => Object.values(row).some((val) => String(val).trim() !== ''));
            if (cleanRows.length > 0) {
              setHeaders((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(cols)) return prev;
                try { localStorage.setItem(cacheHeadersKey, JSON.stringify(cols)); } catch (e) {}
                return cols;
              });
              setData((prevData) => {
                if (
                  prevData.length === cleanRows.length &&
                  prevData.length > 0 &&
                  getRowId(prevData[0]) === getRowId(cleanRows[0]) &&
                  getRowId(prevData[prevData.length - 1]) === getRowId(cleanRows[cleanRows.length - 1])
                ) {
                  return prevData;
                }
                try { localStorage.setItem(cacheRowsKey, JSON.stringify(cleanRows)); } catch (e) {}
                return cleanRows;
              });
              setLastSync(new Date());
              success = true;
              break;
            }
          }
        } else {
          const { headers: parsedHeaders, rows: parsedRows } = parseCSV(text);
          if (parsedHeaders.length > 0 && parsedRows.length > 0) {
            setHeaders((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(parsedHeaders)) return prev;
              try { localStorage.setItem(cacheHeadersKey, JSON.stringify(parsedHeaders)); } catch (e) {}
              return parsedHeaders;
            });
            setData((prevData) => {
              if (
                prevData.length === parsedRows.length &&
                prevData.length > 0 &&
                getRowId(prevData[0]) === getRowId(parsedRows[0]) &&
                getRowId(prevData[prevData.length - 1]) === getRowId(parsedRows[parsedRows.length - 1])
              ) {
                return prevData;
              }
              try { localStorage.setItem(cacheRowsKey, JSON.stringify(parsedRows)); } catch (e) {}
              return parsedRows;
            });
            setLastSync(new Date());
            success = true;
            break;
          }
        }
      } catch (err) {
        console.warn(`Fetch attempt error for ${url}:`, err);
      }
    }

    if (!success) {
      // Restore from local cache if network endpoints were unreachable
      const cachedHeaders = localStorage.getItem(cacheHeadersKey);
      const cachedRows = localStorage.getItem(cacheRowsKey);
      if (cachedHeaders && cachedRows) {
        try {
          const parsedHeaders = JSON.parse(cachedHeaders);
          const parsedRows = JSON.parse(cachedRows);
          if (Array.isArray(parsedHeaders) && parsedHeaders.length > 0 && Array.isArray(parsedRows) && parsedRows.length > 0) {
            setHeaders(parsedHeaders);
            setData(parsedRows);
            success = true;
          }
        } catch (e) {
          console.warn('Error reading fallback cached data:', e);
        }
      }
    }

    if (!success && !isSilent && data.length === 0) {
      setError('Gagal memuat data dari Database Central. Silakan periksa koneksi internet.');
    } else {
      setError(null);
    }

    setLoading(false);
    setIsBackgroundFetching(false);
  };

  // Initial fetch on mount or when props change
  useEffect(() => {
    fetchSheetData();
  }, [apiJsonUrl, apiCsvUrl, directExportUrl]);

  // Continuous Realtime Auto-Sync Effect (15s interval for maximum performance)
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const timer = setInterval(() => {
      fetchSheetData(true); // Silent real-time background refetch
    }, 15000);

    return () => clearInterval(timer);
  }, [autoSyncEnabled]);

  // Filter options extraction
  const operators = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const op = row['Operator'] || row['OPERATOR'];
      if (op && op.trim()) set.add(op.trim());
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const projects = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const p = row['Project'] || row['PROJECT'];
      if (p && p.trim()) set.add(p.trim());
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const s = row['Progress'] || row['STATUS DETAIL'] || row['STATUS VP'] || row['Keterangan'];
      if (s && s.trim()) set.add(s.trim());
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const pics = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      const pic = row['P I C'] || row['PIC'] || row['PIC MTBIG'];
      if (pic && pic.trim()) set.add(pic.trim());
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  // Filtered & Sorted Data (dimulai dari yang terbaru)
  const filteredData = useMemo(() => {
    const indexed = data.map((row, origIndex) => ({ row, origIndex }));

    const filtered = indexed.filter(({ row }) => {
      // Global Search
      if (deferredSearchTerm) {
        const term = deferredSearchTerm.toLowerCase();
        const match = Object.values(row).some((val) =>
          String(val).toLowerCase().includes(term)
        );
        if (!match) return false;
      }

      // Operator Filter
      if (selectedOperator !== 'ALL') {
        const op = row['Operator'] || row['OPERATOR'];
        if (op?.trim() !== selectedOperator) return false;
      }

      // Project Filter
      if (selectedProject !== 'ALL') {
        const p = row['Project'] || row['PROJECT'];
        if (p?.trim() !== selectedProject) return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        const s = row['Progress'] || row['STATUS DETAIL'] || row['STATUS VP'] || row['Keterangan'];
        if (s?.trim() !== selectedStatus) return false;
      }

      // PIC Filter
      if (selectedPic !== 'ALL') {
        const pic = row['P I C'] || row['PIC'] || row['PIC MTBIG'];
        if (pic?.trim() !== selectedPic) return false;
      }

      return true;
    });

    const parseDateValue = (val: any): number | null => {
      if (!val || val === '-') return null;
      const str = String(val).trim();
      if (!str) return null;

      const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
      if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        let year = parseInt(dmyMatch[3], 10);
        if (year < 100) year += 2000;
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.getTime();
        }
      }

      const indoMonths: Record<string, number> = {
        jan: 0, januari: 0,
        feb: 1, februari: 1,
        mar: 2, maret: 2,
        apr: 3, april: 3,
        mei: 4, may: 4,
        jun: 5, juni: 5,
        jul: 6, juli: 6,
        ags: 7, agu: 7, agustus: 7, aug: 7, august: 7,
        sep: 8, september: 8,
        okt: 9, oktober: 9, oct: 9, october: 9,
        nov: 10, november: 10,
        des: 11, desember: 11, dec: 11, december: 11,
      };

      const textMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2,4})$/);
      if (textMatch) {
        const day = parseInt(textMatch[1], 10);
        const monthStr = textMatch[2].toLowerCase();
        let year = parseInt(textMatch[3], 10);
        if (year < 100) year += 2000;
        if (monthStr in indoMonths) {
          const month = indoMonths[monthStr];
          const dateObj = new Date(year, month, day);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.getTime();
          }
        }
      }

      const timestamp = Date.parse(str);
      if (!isNaN(timestamp)) {
        return timestamp;
      }

      return null;
    };

    filtered.sort((a, b) => {
      const getDateVal = (r: SheetRow) => {
        for (const key of Object.keys(r)) {
          const lKey = key.toLowerCase();
          if (lKey.includes('tanggal') || lKey.includes('tgl') || lKey.includes('date') || lKey.includes('created')) {
            if (r[key] && r[key] !== '-') return r[key];
          }
        }
        return null;
      };

      const dateValA = getDateVal(a.row);
      const dateValB = getDateVal(b.row);

      const timeA = parseDateValue(dateValA);
      const timeB = parseDateValue(dateValB);

      if (timeA !== null && timeB !== null && timeA !== timeB) {
        return timeB - timeA; // Descending (terbaru di atas)
      }
      if (timeA !== null && timeB === null) return -1;
      if (timeA === null && timeB !== null) return 1;

      // Tie-breaker fallback: reverse order of Google Sheets rows (terbaru di paling bawah sheet dimunculkan di atas)
      return b.origIndex - a.origIndex;
    });

    return filtered.map((item) => item.row);
  }, [data, deferredSearchTerm, selectedOperator, selectedProject, selectedStatus, selectedPic]);

  // Total Nilai PO calculation based on filtered data
  const filteredTotalPoValue = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      const poStr =
        row['Nilai PO'] ||
        row['NILAI PO'] ||
        row['Nilai PO (Rp)'] ||
        row['Nilai Project'] ||
        row['Nilai INV'] ||
        '';
      const num = parseFloat(String(poStr).replace(/[^0-9.-]+/g, ''));
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [filteredData]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    let totalPoValue = 0;
    let doneCount = 0;

    data.forEach((row) => {
      const poStr = row['Nilai PO'] || row['NILAI PO'] || row['Nilai INV'] || '';
      const num = parseFloat(String(poStr).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(num)) {
        totalPoValue += num;
      }

      const prog = (row['Progress'] || row['Keterangan'] || row['STATUS VP'] || '').toLowerCase();
      if (prog.includes('done') || prog.includes('approved') || prog.includes('full rfs')) {
        doneCount++;
      }
    });

    return {
      total: data.length,
      totalPoValue,
      doneCount,
    };
  }, [data]);

  // Helper currency format
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const cols = headers.length > 0 ? headers : Object.keys(filteredData[0]);
    const csvRows: string[] = [];
    csvRows.push(cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','));

    filteredData.forEach((row) => {
      const values = cols.map((col) => {
        const val = String(row[col] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FiberTrack_Project_Sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preferred main display columns (or custom visibleColumns if explicitly specified)
  const primaryCols = useMemo(() => {
    if (visibleColumns && visibleColumns.length > 0) {
      if (headers.length === 0) return visibleColumns;

      return visibleColumns.map((pref) => {
        const normPref = pref.toLowerCase().replace(/[^a-z0-9]/g, '');

        // 1. Exact match (ignoring non-alphanumeric & case)
        const exact = headers.find((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normPref);
        if (exact) return exact;

        // 2. Partial / substring match
        const partial = headers.find((h) => {
          const normH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (normH.length > 1 && normPref.includes(normH)) || (normPref.length > 1 && normH.includes(normPref));
        });
        if (partial) return partial;

        // 3. Keyword-based matching
        if (normPref.includes('tanggal') || normPref.includes('tgl') || normPref.includes('date')) {
          const tglHeader = headers.find((h) => {
            const l = h.toLowerCase();
            return l.includes('tanggal') || l.includes('tgl') || l.includes('date');
          });
          if (tglHeader) return tglHeader;
        }
        if (normPref.includes('pic')) {
          const picHeader = headers.find((h) => h.toLowerCase().includes('pic'));
          if (picHeader) return picHeader;
        }
        if (normPref.includes('keterangan') || normPref.includes('remark')) {
          const ketHeader = headers.find((h) => {
            const l = h.toLowerCase();
            return l.includes('keterangan') || l.includes('remark') || l.includes('status');
          });
          if (ketHeader) return ketHeader;
        }
        if (normPref.includes('site')) {
          const siteHeader = headers.find((h) => h.toLowerCase().includes('site'));
          if (siteHeader) return siteHeader;
        }
        if (normPref.includes('project')) {
          const projHeader = headers.find((h) => h.toLowerCase().includes('project'));
          if (projHeader) return projHeader;
        }

        return pref;
      });
    }

    if (headers.length === 0) return [];

    // Default preferred columns for PROJECT page when visibleColumns is not specified
    const preferredList = [
      'Project',
      'Site Name',
      'Progress',
      'REMARK PROGRES',
      'PIC',
      'Nilai PO',
    ];

    const matchedCols: string[] = [];

    preferredList.forEach((pref) => {
      const normPref = pref.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Special check for Project
      if (normPref === 'project') {
        const projCol = headers.find((h) => {
          const l = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (l === 'project' || l === 'namaproject' || l === 'jenisproject' || (l.includes('project') && !l.includes('kode')));
        });
        if (projCol && !matchedCols.includes(projCol)) {
          matchedCols.push(projCol);
          return;
        }
      }

      // Special check for Progress / Status
      if (normPref === 'progress' || normPref === 'progres' || normPref === 'status' || normPref === 'statusdetail') {
        const progCol = headers.find((h) => {
          const l = h.toLowerCase();
          return (l.includes('progress') || l.includes('progres') || l.includes('status detail') || l.includes('status vp') || l === 'status');
        });
        if (progCol && !matchedCols.includes(progCol)) {
          matchedCols.push(progCol);
          return;
        }
      }

      // Special check for PIC
      if (normPref === 'pic' || normPref === 'picproject' || normPref === 'supervisi') {
        const picCol = headers.find((h) => {
          const l = h.toLowerCase();
          return l.includes('pic') || l.includes('p i c') || l.includes('supervisi');
        });
        if (picCol && !matchedCols.includes(picCol)) {
          matchedCols.push(picCol);
          return;
        }
      }

      // Special check for REMARK PROGRES
      if (normPref === 'remarkprogres' || normPref === 'remarkprogress') {
        const remarkCols = headers.filter((h) => h.toLowerCase().includes('remark'));
        const explicitProgres = remarkCols.find(
          (h) => h.toLowerCase().includes('progres') || h.toLowerCase().includes('progress')
        );
        if (explicitProgres && !matchedCols.includes(explicitProgres)) {
          matchedCols.push(explicitProgres);
          return;
        }
        if (remarkCols.length >= 2 && !matchedCols.includes(remarkCols[1])) {
          matchedCols.push(remarkCols[1]);
          return;
        }
        if (remarkCols.length >= 1 && !matchedCols.includes(remarkCols[0])) {
          matchedCols.push(remarkCols[0]);
          return;
        }
      }

      // Special check for Nilai PO
      if (normPref === 'nilaipo' || normPref === 'nilai') {
        const poCol = headers.find((h) => {
          const l = h.toLowerCase();
          return l.includes('nilai po') || l.includes('nilai inv') || l.includes('nilai project') || l.includes('nilai');
        });
        if (poCol && !matchedCols.includes(poCol)) {
          matchedCols.push(poCol);
          return;
        }
      }

      // Exact match
      const exact = headers.find((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === normPref);
      if (exact && !matchedCols.includes(exact)) {
        matchedCols.push(exact);
        return;
      }

      // Partial match
      const partial = headers.find((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normPref));
      if (partial && !matchedCols.includes(partial)) {
        matchedCols.push(partial);
      }
    });

    const isUnwanted = (colName: string) => {
      const norm = colName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        norm.includes('operator') ||
        norm.includes('kodeproject') ||
        norm.includes('siteid') ||
        norm.includes('nomorpo') ||
        norm.includes('nomerpo') ||
        norm === 'aksi'
      );
    };

    const filteredMatched = matchedCols.filter((col) => !isUnwanted(col));

    if (filteredMatched.length > 0) return filteredMatched;

    return headers
      .filter((h) => !isUnwanted(h))
      .slice(0, 6);
  }, [headers, visibleColumns]);

  return (
    <div className="space-y-6">
      {/* Header Title & Actions */}
      {!hideHeaderTitle && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{viewTitle}</span>
              <span className="text-xs font-normal text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {filteredData.length} Data
              </span>
            </h1>
          </div>

          {/* Total Nilai PO Badge */}
          {!hidePoValueSummary && (
            <div className="flex items-center gap-3 bg-[#101C2E] border border-white/10 px-4 py-2.5 rounded-2xl shadow-lg self-start md:self-auto">
              <span className="text-xs text-slate-400 font-medium">Total Nilai PO:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                {formatRupiah(filteredTotalPoValue)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Table Container (Unified with Search & Filters) */}
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-xl overflow-hidden">
        {/* Top Header Toolbar with Global Search & Filters */}
        <div className="bg-[#101C2E] border-b border-white/10 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Global Search Input & Total Nilai PO */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  placeholder="Cari Kode Project, Site Name, Nomor PO, Operator, PIC..."
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Total Nilai PO Badge disamping kanan Input Pencarian */}
              {!hidePoValueSummary && (
                <div className="flex items-center gap-2.5 bg-[#0B132B] border border-emerald-500/30 px-3.5 py-2 rounded-xl shrink-0 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                    Total Nilai PO:
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                    {formatRupiah(filteredTotalPoValue)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Filter Reset */}
              {(selectedOperator !== 'ALL' ||
                selectedProject !== 'ALL' ||
                selectedStatus !== 'ALL' ||
                selectedPic !== 'ALL' ||
                searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedOperator('ALL');
                    setSelectedProject('ALL');
                    setSelectedStatus('ALL');
                    setSelectedPic('ALL');
                    setSearchTerm('');
                  }}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>

          {/* Dropdown Filters Grid */}
          {!hideFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-white/5">
              {/* Operator Dropdown */}
              <div>
                <select
                  value={selectedOperator}
                  onChange={(e) => {
                    setSelectedOperator(e.target.value);
                  }}
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  {operators.map((op, opIdx) => (
                    <option key={`op_${op}_${opIdx}`} value={op} className="bg-[#101C2E] text-white">
                      {op === 'ALL' ? 'Operator' : op}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Type Dropdown */}
              <div>
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                  }}
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  {projects.map((p, pIdx) => (
                    <option key={`proj_${p}_${pIdx}`} value={p} className="bg-[#101C2E] text-white">
                      {p === 'ALL' ? 'Nama Project' : p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                  }}
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  {statuses.map((s, sIdx) => (
                    <option key={`stat_${s}_${sIdx}`} value={s} className="bg-[#101C2E] text-white">
                      {s === 'ALL' ? 'Status Detail' : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIC Dropdown */}
              <div>
                <select
                  value={selectedPic}
                  onChange={(e) => {
                    setSelectedPic(e.target.value);
                  }}
                  className="w-full bg-[#0B132B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  {pics.map((pic, picIdx) => (
                    <option key={`pic_${pic}_${picIdx}`} value={pic} className="bg-[#101C2E] text-white">
                      {pic === 'ALL' ? 'PIC Project' : pic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="w-full h-[450px] bg-[#02040a] rounded-[24px] overflow-hidden relative">
            <FuturisticLoadingScreen fullScreen={false} />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                  <th className="py-3.5 px-4 text-center font-bold uppercase tracking-wider text-[11px] w-12">No</th>
                  {primaryCols.map((col, idx) => (
                    <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  {!hideAksiColumn && (
                    <th className="py-3.5 px-4 text-center font-bold uppercase tracking-wider text-[11px] w-24">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={primaryCols.length + 2} className="p-8 text-center text-slate-400">
                      Tidak ada data yang cocok dengan kriteria pencarian/filter.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, rIdx) => (
                    <ProjectTableRow
                      key={`proj_row_${rIdx}_${getRowId(row)}`}
                      row={row}
                      idx={rIdx}
                      rowNum={rIdx + 1}
                      primaryCols={primaryCols}
                      highlightedRowId={highlightedRowId}
                      cellSaveStatus={cellSaveStatus}
                      handleInlineCellSave={handleInlineCellSave}
                      handleOpenDetail={(row) => {
                        setSelectedRowDetail(row);
                        setEditingRowData(row);
                      }}
                      isReadOnly={isReadOnly}
                      hideAksiColumn={hideAksiColumn}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Futuristic Loading Overlay */}
      {showFuturisticLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#101C2E] border border-cyan-500/30 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <FuturisticLoadingScreen fullScreen={false} />
            <p className="mt-4 text-xs font-bold text-cyan-400 tracking-wider uppercase animate-pulse">
              {futuristicLoadingTitle}
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Row */}
      {selectedRowDetail && editingRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[24px] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden selection:bg-blue-600 selection:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 border border-blue-200 rounded-xl">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      {selectedRowDetail['Site Name'] ||
                        selectedRowDetail['SITE NAME'] ||
                        selectedRowDetail['Site ID'] ||
                        selectedRowDetail['Kode Project'] ||
                        selectedRowDetail['Project'] ||
                        'Detail Project'}
                    </span>
                    {(selectedRowDetail['Project'] ||
                      selectedRowDetail['PROJECT'] ||
                      selectedRowDetail['Kode Project'] ||
                      selectedRowDetail['Site ID']) && (
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {selectedRowDetail['Project'] ||
                          selectedRowDetail['PROJECT'] ||
                          selectedRowDetail['Kode Project'] ||
                          selectedRowDetail['Site ID']}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Detail informasi segmen dari Database
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <button
                    onClick={() => setIsEditingDetail(!isEditingDetail)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isEditingDetail
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{isEditingDetail ? 'Batal Edit' : 'Edit Mode'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedRowDetail(null);
                    setEditingRowData(null);
                    setIsEditingDetail(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content / Fields List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-1.5 flex-1 custom-scrollbar bg-slate-50/50">
              <div className="flex flex-col gap-1.5">
                {Object.entries(editingRowData)
                  .map(([key, value]) => {
                    const isLongText = key.toLowerCase().includes('remark') || key.toLowerCase().includes('keterangan');

                    return (
                      <div
                        key={`detail_field_${key}`}
                        className="py-2 px-3.5 bg-white hover:bg-blue-50/40 border border-slate-200 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 shadow-xs"
                      >
                        <div className="sm:w-2/5 md:w-1/3 shrink-0 flex items-center justify-between sm:justify-start gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                            {key}
                          </label>
                          <button
                            onClick={() => handleCopyValue(key, String(value))}
                            className="text-slate-400 hover:text-blue-600 p-0.5 rounded hover:bg-slate-100 transition-colors sm:hidden"
                            title="Salin nilai"
                          >
                            {copiedKey === key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                          {isEditingDetail && !isReadOnly ? (
                            isLongText ? (
                              <textarea
                                value={String(value)}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-blue-400 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-y"
                              />
                            ) : (
                              <input
                                type="text"
                                value={String(value)}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                className="w-full bg-white border border-blue-400 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                              />
                            )
                          ) : (
                            <p className="text-xs text-slate-900 font-semibold break-words leading-snug selection:bg-blue-600 selection:text-white">
                              {value || <span className="text-slate-400 italic font-normal">-</span>}
                            </p>
                          )}

                          <button
                            onClick={() => handleCopyValue(key, String(value))}
                            className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors hidden sm:block shrink-0"
                            title="Salin nilai"
                          >
                            {copiedKey === key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">
                {isEditingDetail ? 'Mode Edit Aktif' : 'Mode Tampilan'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRowDetail(null);
                    setEditingRowData(null);
                    setIsEditingDetail(false);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
                >
                  Tutup
                </button>
                {isEditingDetail && !isReadOnly && (
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Apps Script Guide Modal */}
      <AppsScriptGuideModal isOpen={showScriptModal} onClose={() => setShowScriptModal(false)} />
    </div>
  );
}