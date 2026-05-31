'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { useState, useEffect } from 'react';
import TableCard from '@/components/tables/TableCard';
import TableDetailsModal from '@/components/tables/TableDetailsModal';
import { PoolTable } from '@/lib/types';
import { CheckCircle2, Play, Wrench, Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TablesPage() {
  const { tables, addTable } = useData();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<PoolTable | null>(null);


  // Administrative form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTablePrice, setNewTablePrice] = useState(60000);



  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;
    addTable(newTableName, newTablePrice);
    setNewTableName('');
    setNewTablePrice(60000);
    setShowAddForm(false);
  };

  const availableTables = tables.filter((t) => t.status === 'available');
  const inUseTables = tables.filter((t) => t.status === 'in-use');
  const maintenanceTables = tables.filter((t) => t.status === 'maintenance');

  const stats = [
    { label: 'Trống', value: availableTables.length, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Đang chơi', value: inUseTables.length, icon: <Play size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
    { label: 'Bảo trì', value: maintenanceTables.length, icon: <Wrench size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Bàn</h1>
          <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{tables.length} bàn</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium">
            <Clock size={14} />
            <span>{new Date().toLocaleTimeString('vi-VN')}</span>
          </div>
          {isAdmin && !showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 font-semibold shadow-sm"
            >
              <Plus size={16} className="mr-2" /> Thêm bàn
            </Button>
          )}
        </div>
      </div>

      {/* Admin Add Table Form */}
      {isAdmin && showAddForm && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Thêm bàn bida mới</h2>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên bàn</label>
              <Input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="VD: Bàn 5, Bàn VIP 3..."
                required
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá thuê (VND/giờ)</label>
              <Input
                type="number"
                value={newTablePrice}
                onChange={(e) => setNewTablePrice(Number(e.target.value))}
                min="0"
                required
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl">
                Tạo mới
              </Button>
              <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" className="h-11 px-4 rounded-xl font-medium text-slate-500">
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Mini stats */}
      <div className="flex items-center gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${s.bg} ring-1 ${s.ring}`}>
            <div className={s.color}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All tables in a single grid */}
      <div>
        {tables.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center">
            <p className="text-slate-400">Chưa có bàn nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onSelect={() => setSelectedTable(table)}
              />
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          currentUser={user}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </>
  );
}
