export function generateAppsScriptCode(sheetName: string = 'Sheet1'): string {
  return `/**
 * ==============================================================================
 * APPS SCRIPT DATABASE API UNTUK WEB APPLICATION
 * ==============================================================================
 * Petunjuk Penggunaan:
 * 1. Buka lembar kerja Anda.
 * 2. Klik menu: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus kode bawaan dan tempel (paste) seluruh kode di bawah ini.
 * 4. Simpan proyek (Ctrl+S atau ikon Disket).
 * 5. Klik tombol "Terapkan" (Deploy) di kanan atas > "Terapkan sebagai Aplikasi Web" (New deployment).
 * 6. Pilih Jenis: "Aplikasi Web" (Web app).
 * 7. Setel Jalankan sebagai (Execute as): "Saya" (Me).
 * 8. Setel Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone).
 * 9. Klik "Terapkan" (Deploy) dan berikan izin otorisasi Google.
 * 10. Salin "URL Aplikasi Web" (Web App URL) dan tempelkan pada aplikasi web ini.
 * ==============================================================================
 */

const DEFAULT_SHEET_NAME = "${sheetName}";

function doGet(e) {
  const sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : DEFAULT_SHEET_NAME;
  return handleReadData(sheetName);
}

function doPost(e) {
  try {
    let contents;
    if (e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else {
      contents = e.parameter || {};
    }

    const action = contents.action || 'read';
    const sheetName = contents.sheetName || (e.parameter && e.parameter.sheet) || DEFAULT_SHEET_NAME;

    switch (action) {
      case 'read':
        return handleReadData(sheetName);

      case 'create':
        return handleCreateRow(sheetName, contents.row);

      case 'update':
        return handleUpdateRow(sheetName, contents.id, contents.row);

      case 'delete':
        return handleDeleteRow(sheetName, contents.id);

      case 'batchDelete':
        return handleBatchDeleteRows(sheetName, contents.ids);

      case 'test':
        return responseJSON({
          status: 'success',
          message: 'Koneksi Apps Script berhasil terhubung!',
          timestamp: new Date().toISOString()
        });

      default:
        return responseJSON({ status: 'error', message: 'Aksi tidak dikenal: ' + action }, 400);
    }
  } catch (err) {
    return responseJSON({ status: 'error', message: 'Gagal memproses permintaan: ' + err.toString() }, 500);
  }
}

// ------------------------------------------------------------------------------
// FUNGSI UTAMA MANAJEMEN DATA
// ------------------------------------------------------------------------------

function handleReadData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.getSheets()[0]; // Fallback ke sheet pertama jika nama tidak ditemukan
  }

  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    return responseJSON({ status: 'success', sheetName: sheet.getName(), headers: [], rows: [] });
  }

  const rawHeaders = data[0];
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase().replace(/\\s+/g, '_'));
  
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    let hasData = false;
    
    for (let j = 0; j < headers.length; j++) {
      const val = data[i][j];
      const headerKey = headers[j] || ('col_' + (j + 1));
      rowObj[headerKey] = val instanceof Date ? val.toISOString().split('T')[0] : val;
      if (val !== '' && val !== null && val !== undefined) {
        hasData = true;
      }
    }
    
    if (hasData) {
      // Jika tidak ada kolom ID khusus, gunakan id bawaan berdasarkan nomor baris
      if (!rowObj.id && !rowObj.id_barang && !rowObj.nip && !rowObj.no_pesanan) {
        rowObj.id = 'ROW_' + i;
      }
      rowObj._rowIndex = i + 1; // Nomor baris di Spreadsheet (1-based index)
      rows.push(rowObj);
    }
  }

  return responseJSON({
    status: 'success',
    sheetName: sheet.getName(),
    rawHeaders: rawHeaders,
    headers: headers,
    rows: rows
  });
}

function handleCreateRow(sheetName, rowData) {
  if (!rowData) {
    return responseJSON({ status: 'error', message: 'Data baris baru tidak boleh kosong' }, 400);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    return responseJSON({ status: 'error', message: 'Sheet belum memiliki header kolom' }, 400);
  }

  const rawHeaders = data[0];
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase().replace(/\\s+/g, '_'));

  // Otomatis buat ID jika belum diisi
  if (!rowData.id) {
    rowData.id = 'ID-' + Math.floor(1000 + Math.random() * 9000);
  }

  const newRowValues = headers.map(headerKey => {
    return rowData[headerKey] !== undefined ? rowData[headerKey] : '';
  });

  sheet.appendRow(newRowValues);

  return responseJSON({
    status: 'success',
    message: 'Data berhasil ditambahkan ke Database Central',
    createdRow: rowData
  });
}

function handleUpdateRow(sheetName, id, updatedData) {
  if (!id || !updatedData) {
    return responseJSON({ status: 'error', message: 'ID dan Data perbaharuan diperlukan' }, 400);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return responseJSON({ status: 'error', message: 'Tidak ada data untuk diperbarui' }, 404);
  }

  const rawHeaders = data[0];
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase().replace(/\\s+/g, '_'));

  let targetRowIndex = -1;

  // Cari baris berdasarkan ID atau _rowIndex
  if (updatedData._rowIndex && Number(updatedData._rowIndex) > 1) {
    targetRowIndex = Number(updatedData._rowIndex);
  } else {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Periksa kolom ID mana pun yang cocok
      for (let j = 0; j < headers.length; j++) {
        if (headers[j] === 'id' || headers[j].includes('id') || headers[j] === 'nip' || headers[j] === 'no_pesanan') {
          if (String(row[j]).trim() === String(id).trim()) {
            targetRowIndex = i + 1; // 1-based index untuk Spreadsheet
            break;
          }
        }
      }
      if (targetRowIndex !== -1) break;
    }
  }

  if (targetRowIndex === -1) {
    return responseJSON({ status: 'error', message: 'Baris dengan ID "' + id + '" tidak ditemukan' }, 404);
  }

  // Perbarui sel satu per satu
  for (let j = 0; j < headers.length; j++) {
    const key = headers[j];
    if (updatedData[key] !== undefined) {
      sheet.getRange(targetRowIndex, j + 1).setValue(updatedData[key]);
    }
  }

  return responseJSON({
    status: 'success',
    message: 'Data berhasil diperbarui di Database Central',
    updatedId: id,
    rowIndex: targetRowIndex
  });
}

function handleDeleteRow(sheetName, id) {
  if (!id) {
    return responseJSON({ status: 'error', message: 'ID baris diperlukan untuk menghapus' }, 400);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return responseJSON({ status: 'error', message: 'Tidak ada data untuk dihapus' }, 404);
  }

  const rawHeaders = data[0];
  const headers = rawHeaders.map(h => String(h).trim().toLowerCase().replace(/\s+/g, '_'));

  let targetRowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Periksa ID
    for (let j = 0; j < headers.length; j++) {
      if (headers[j] === 'id' || headers[j].includes('id') || headers[j] === 'nip' || headers[j] === 'no_pesanan') {
        if (String(row[j]).trim() === String(id).trim()) {
          targetRowIndex = i + 1;
          break;
        }
      }
    }
    if (targetRowIndex !== -1) break;
  }

  // Jika ID berbentuk ROW_N
  if (targetRowIndex === -1 && String(id).startsWith('ROW_')) {
    const rowNum = parseInt(String(id).replace('ROW_', ''), 10);
    if (!isNaN(rowNum) && rowNum < data.length) {
      targetRowIndex = rowNum + 1;
    }
  }

  if (targetRowIndex === -1) {
    return responseJSON({ status: 'error', message: 'Data dengan ID "' + id + '" tidak ditemukan' }, 404);
  }

  sheet.deleteRow(targetRowIndex);

  return responseJSON({
    status: 'success',
    message: 'Data berhasil dihapus dari Database Central',
    deletedId: id
  });
}

function handleBatchDeleteRows(sheetName, ids) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return responseJSON({ status: 'error', message: 'Daftar ID tidak valid' }, 400);
  }

  let deletedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    const res = handleDeleteRow(sheetName, ids[i]);
    if (res && res.getContent) {
      const parsed = JSON.parse(res.getContent());
      if (parsed.status === 'success') deletedCount++;
    }
  }

  return responseJSON({
    status: 'success',
    message: deletedCount + ' baris berhasil dihapus dari Database Central'
  });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}
