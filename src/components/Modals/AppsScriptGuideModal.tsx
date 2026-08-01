import React, { useState } from 'react';
import { X, Copy, Check, Code2, Sparkles, ExternalLink, ShieldAlert } from 'lucide-react';

interface AppsScriptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptGuideModal: React.FC<AppsScriptGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appsScriptCode = `/**
 * FiberTrack Enterprise SaaS - Apps Script Backend API
 * Salin kode ini ke Extensions -> Apps Script di lembar kerja Anda
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var output = { status: "success", data: [] };
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheetName = (e && e.parameter && e.parameter.sheet) || "FiberTrack_Projects";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Auto-create header row
      sheet.appendRow(["ID", "ProjectName", "Location", "Status", "Progress", "DueDate", "Contractor", "Budget", "CoresCount", "UpdatedAt"]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#0E1728").setFontColor("#FFFFFF");
    }

    var action = (e && e.parameter && e.parameter.action) || "READ";
    var postData = null;
    
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
        if (postData.action) action = postData.action;
      } catch (err) {}
    }

    if (action === "TEST") {
      output.message = "Koneksi Apps Script FiberTrack Berhasil Active!";
    } else if (action === "READ") {
      var rows = sheet.getDataRange().getValues();
      if (rows.length > 1) {
        var headers = rows[0];
        for (var i = 1; i < rows.length; i++) {
          var rowObj = {};
          for (var h = 0; h < headers.length; h++) {
            rowObj[headers[h]] = rows[i][h];
          }
          output.data.push(rowObj);
        }
      }
    } else if (action === "CREATE" || action === "UPDATE") {
      var item = postData.item;
      var rows = sheet.getDataRange().getValues();
      var foundRow = -1;
      
      for (var r = 1; r < rows.length; r++) {
        if (rows[r][0] == item.id) {
          foundRow = r + 1;
          break;
        }
      }

      var rowData = [
        item.id,
        item.projectName || item.itemCode || "",
        item.location || item.description || "",
        item.status || "In Progress",
        item.progress || item.quantity || 0,
        item.dueDate || item.unit || "",
        item.contractor || item.unitPrice || 0,
        item.budget || item.totalPrice || 0,
        item.coresCount || 96,
        new Date().toISOString()
      ];

      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
        output.message = "Data berhasil diperbarui di Database Central";
      } else {
        sheet.appendRow(rowData);
        output.message = "Data baru berhasil ditambahkan ke Database Central";
      }
    } else if (action === "DELETE") {
      var idToDelete = (postData && postData.id) || (e && e.parameter && e.parameter.id);
      var rows = sheet.getDataRange().getValues();
      for (var r = 1; r < rows.length; r++) {
        if (rows[r][0] == idToDelete) {
          sheet.deleteRow(r + 1);
          output.message = "Data ID " + idToDelete + " berhasil dihapus";
          break;
        }
      }
    }
  } catch (error) {
    output.status = "error";
    output.message = error.toString();
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101C2E] border border-cyan-500/30 rounded-[24px] max-w-2xl w-full p-6 shadow-2xl relative text-slate-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kode Apps Script Backend</h3>
              <p className="text-xs text-slate-400">Hubungkan Database Central Anda dengan FiberTrack dalam 3 Langkah</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-2 mb-4 text-xs text-slate-300 shrink-0">
          <div className="p-2.5 bg-[#08111F] rounded-xl border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">1</span>
            <span>Buka lembar kerja milik Anda &rarr; Pilih menu <b>Extensions</b> &rarr; <b>Apps Script</b>.</span>
          </div>
          <div className="p-2.5 bg-[#08111F] rounded-xl border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">2</span>
            <span>Hapus kode bawaan, lalu salin (copy) seluruh blok kode Apps Script di bawah ini.</span>
          </div>
          <div className="p-2.5 bg-[#08111F] rounded-xl border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">3</span>
            <span>Klik <b>Deploy</b> &rarr; <b>New deployment</b> &rarr; Pilih Type: <b>Web app</b> &rarr; Set Access: <b>Anyone</b> &rarr; Salin Web App URL ke FiberTrack Settings.</span>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative flex-1 overflow-hidden bg-[#060D1A] border border-slate-800 rounded-2xl flex flex-col mb-4">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0E1728] border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>Code.gs</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          <pre className="p-4 text-[11px] font-mono text-cyan-300 overflow-y-auto flex-1 leading-relaxed selection:bg-cyan-500/30">
            {appsScriptCode}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Pastikan opsi Access diatur ke "Anyone" agar aplikasi dapat membaca/menulis data.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
