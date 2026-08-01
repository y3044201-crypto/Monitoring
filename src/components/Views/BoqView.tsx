import React, { useState } from 'react';
import { BoqItem } from '../../types';
import { INITIAL_BOQ } from '../../data/mockData';
import { 
  Boxes, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  DollarSign,
  Cloud,
  X,
  Save
} from 'lucide-react';

interface BoqViewProps {
  onSyncGoogleSheets?: () => void;
}

export const BoqView: React.FC<BoqViewProps> = ({ onSyncGoogleSheets }) => {
  const [items, setItems] = useState<BoqItem[]>(INITIAL_BOQ);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BoqItem | null>(null);

  const [formData, setFormData] = useState<Partial<BoqItem>>({
    id: `BOQ-${Math.floor(100 + Math.random() * 900)}`,
    itemCode: '',
    description: '',
    category: 'Fiber Cable',
    quantity: 100,
    unit: 'Meter',
    unitPrice: 50000,
    status: 'In Stock',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `BOQ-${Math.floor(100 + Math.random() * 900)}`,
      itemCode: `FOC-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      category: 'Fiber Cable',
      quantity: 100,
      unit: 'Meter',
      unitPrice: 50000,
      status: 'In Stock',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BoqItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemCode || !formData.description) return;

    const qty = Number(formData.quantity) || 0;
    const price = Number(formData.unitPrice) || 0;
    const total = qty * price;

    const newItem: BoqItem = {
      id: formData.id || `BOQ-${Date.now()}`,
      itemCode: formData.itemCode || '',
      description: formData.description || '',
      category: (formData.category as any) || 'Fiber Cable',
      quantity: qty,
      unit: (formData.unit as any) || 'Meter',
      unitPrice: price,
      totalPrice: total,
      status: (formData.status as any) || 'In Stock',
    };

    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? newItem : i)));
    } else {
      setItems((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const grandTotal = items.reduce((acc, i) => acc + i.totalPrice, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#101C2E] border border-white/5 rounded-[24px] p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              <Boxes className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Bill of Quantities (BOQ) & Inventaris</h2>
          </div>
          <p className="text-xs text-slate-400">Manajemen Material Serat Optik, Aksesoris Splice, ODF, dan OLT</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#08111F] px-4 py-2.5 rounded-2xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Total Nilai Material</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              Rp {grandTotal.toLocaleString('id-ID')}
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item BOQ</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-[#101C2E]/90 border border-white/5 rounded-[24px] p-5 shadow-xl backdrop-blur-md space-y-4">
        
        {/* Search and Category Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode material atau deskripsi item..."
              className="w-full bg-[#08111F] border border-slate-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'Fiber Cable', 'Splice Enclosure', 'OLT / ONT', 'Patch Cord', 'ODF Cabinet'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#08111F] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* BOQ Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Kode Item</th>
                <th className="py-3 px-3">Deskripsi Material</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Jumlah</th>
                <th className="py-3 px-3">Harga Satuan (IDR)</th>
                <th className="py-3 px-3">Total Harga</th>
                <th className="py-3 px-3">Status Stock</th>
                <th className="py-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada item material ditemukan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0E1728]/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{item.itemCode}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-100">{item.description}</td>
                    <td className="py-3.5 px-3 text-slate-400">{item.category}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {item.quantity.toLocaleString('id-ID')} {item.unit}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      Rp {item.unitPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      Rp {item.totalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'In Stock'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'Allocated'
                          ? 'bg-blue-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
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

      {/* BOQ Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#101C2E] border border-cyan-500/30 rounded-[24px] max-w-lg w-full p-6 shadow-2xl relative text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Item BOQ' : 'Tambah Item Material BOQ'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Kode Material</label>
                <input
                  type="text"
                  required
                  value={formData.itemCode || ''}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  placeholder="FOC-144C-ADSS"
                  className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Material</label>
                <input
                  type="text"
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kabel Fiber Optik Single Mode..."
                  className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={formData.category || 'Fiber Cable'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="Fiber Cable">Fiber Cable</option>
                    <option value="Splice Enclosure">Splice Enclosure</option>
                    <option value="OLT / ONT">OLT / ONT</option>
                    <option value="Patch Cord">Patch Cord</option>
                    <option value="ODF Cabinet">ODF Cabinet</option>
                    <option value="Civil Hardware">Civil Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Satuan</label>
                  <select
                    value={formData.unit || 'Meter'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="Meter">Meter</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Set">Set</option>
                    <option value="Roll">Roll</option>
                    <option value="Unit">Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jumlah Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Harga Satuan (IDR)</label>
                  <input
                    type="number"
                    value={formData.unitPrice || 0}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-[#08111F] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg"
                >
                  Simpan Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
