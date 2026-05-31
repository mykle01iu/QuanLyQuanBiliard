'use client';

import { PoolTable } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { Gamepad2, Clock, CheckCircle2, AlertTriangle, Play, Info } from 'lucide-react';

interface TableCardProps {
  table: PoolTable;
  onSelect: () => void;
}

export default function TableCard({ table, onSelect }: TableCardProps) {
  const { getTableSession, startTableSession } = useData();
  const { user } = useAuth();
  const session = getTableSession(table.id);

  const statusConfig = {
    available: {
      bg: 'bg-white',
      border: 'border-slate-200',
      badge: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
      icon: <CheckCircle2 size={14} className="mr-1" />,
      label: 'Trống',
      btn: 'bg-slate-900 hover:bg-slate-800 text-white',
      btnIcon: <Play size={16} className="mr-2" />
    },
    'in-use': {
      bg: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400 ring-offset-2 animate-pulse-slow',
      border: 'border-transparent',
      badge: 'bg-white/20 text-white border border-white/20 backdrop-blur-md',
      icon: <Clock size={14} className="mr-1 animate-spin-slow" />,
      label: 'Đang sử dụng',
      btn: 'bg-white text-emerald-600 hover:bg-white/90',
      btnIcon: <Info size={16} className="mr-2" />
    },
    maintenance: {
      bg: 'bg-slate-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700 border border-amber-200/50',
      icon: <AlertTriangle size={14} className="mr-1" />,
      label: 'Bảo trì',
      btn: 'bg-slate-200 text-slate-500 cursor-not-allowed',
      btnIcon: <AlertTriangle size={16} className="mr-2" />
    },
  };

  const config = statusConfig[table.status as keyof typeof statusConfig];
  const isInUse = table.status === 'in-use';

  let elapsedTime = 'N/A';
  if (session && session.startTime) {
    const now = new Date();
    const start = new Date(session.startTime);
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    elapsedTime = `${hours}h ${minutes}m`;
  }

  return (
    <div className="relative group">
      {isInUse && (
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
      )}
      <Card
        onClick={onSelect}
        className={`relative h-full ${config.bg} border-2 ${config.border} p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col`}
      >
        {/* Decor */}
        {isInUse && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -z-0"></div>
        )}

        <div className="flex items-start justify-between gap-2 mb-4 relative z-10">
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${isInUse ? 'text-white' : 'text-slate-800'}`}>{table.name}</h3>
            <div className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
              {config.icon}
              {config.label}
            </div>
          </div>
          <div className={`p-2 rounded-xl ${isInUse ? 'bg-white/20 backdrop-blur-sm' : 'bg-slate-100 text-slate-400'}`}>
            <Gamepad2 size={24} className={isInUse ? 'text-white' : ''} />
          </div>
        </div>

        <div className="space-y-3 mb-6 flex-1 relative z-10">
          <div className={`rounded-xl p-3 flex justify-between items-center ${isInUse ? 'bg-black/10' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-xs font-medium ${isInUse ? 'text-white/80' : 'text-slate-500'}`}>Giá thuê</p>
            <p className={`text-base font-bold ${isInUse ? 'text-white' : 'text-slate-700'}`}>
              {table.pricePerHour.toLocaleString('vi-VN')}đ/h
            </p>
          </div>

          {session && (
            <div className={`rounded-xl p-3 flex justify-between items-center ${isInUse ? 'bg-black/10' : 'bg-slate-50 border border-slate-100'}`}>
              <p className={`text-xs font-medium ${isInUse ? 'text-white/80' : 'text-slate-500'}`}>Thời gian chơi</p>
              <p className={`text-base font-bold ${isInUse ? 'text-white' : 'text-slate-700'}`}>{elapsedTime}</p>
            </div>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (table.status === 'available' && user) {
              startTableSession(table.id, user.id);
            } else {
              onSelect();
            }
          }}
          className={`w-full py-3 flex items-center justify-center text-sm font-bold rounded-xl transition-all relative z-10 ${config.btn}`}
        >
          {config.btnIcon}
          {table.status === 'available' ? 'Bắt đầu ngay' : table.status === 'in-use' ? 'Xem chi tiết' : 'Bảo trì'}
        </button>
      </Card>
    </div>
  );
}
