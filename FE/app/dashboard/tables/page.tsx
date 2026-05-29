'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { useState, useEffect } from 'react';
import TableCard from '@/components/tables/TableCard';
import TableDetailsModal from '@/components/tables/TableDetailsModal';
import { PoolTable } from '@/lib/types';
import { CheckCircle2, Play, Wrench, Clock } from 'lucide-react';

export default function TablesPage() {
  const { tables } = useData();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<PoolTable | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const availableTables = tables.filter((t) => t.status === 'available');
  const inUseTables = tables.filter((t) => t.status === 'in_use');
  const maintenanceTables = tables.filter((t) => t.status === 'maintenance');

  const stats = [
    { label: 'Trống', value: availableTables.length, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Đang chơi', value: inUseTables.length, icon: <Play size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
    { label: 'Bảo trì', value: maintenanceTables.length, icon: <Wrench size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" key={refreshKey}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Bàn</h1>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock size={14} />
          <span>{new Date().toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

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

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          currentUser={user}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
}
