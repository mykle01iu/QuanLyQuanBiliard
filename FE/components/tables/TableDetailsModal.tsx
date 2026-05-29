'use client';

import { PoolTable, User, InvoiceItem } from '@/lib/types';
import { useData } from '@/lib/dataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CheckCircle2, Play, Square, X, Clock, Receipt, AlertTriangle } from 'lucide-react';

interface TableDetailsModalProps {
  table: PoolTable;
  currentUser: User | null;
  onClose: () => void;
}

export default function TableDetailsModal({
  table,
  currentUser,
  onClose,
}: TableDetailsModalProps) {
  const { startTableSession, endTableSession, getTableSession, createInvoice } =
    useData();
  const [showPayment, setShowPayment] = useState(false);
  const session = getTableSession(table.id);

  const handleStartSession = () => {
    if (currentUser) {
      startTableSession(table.id, currentUser.id);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleEndSession = () => {
    if (session) {
      endTableSession(session.id);
      setShowPayment(true);
    }
  };

  const handleCreateInvoice = () => {
    if (session && currentUser) {
      const now = new Date();
      const start = new Date(session.startTime);
      const diffMs = now.getTime() - start.getTime();
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));

      const tableItem: InvoiceItem = {
        id: `item-${Date.now()}`,
        type: 'table',
        name: `${table.name} - ${hours} giờ`,
        quantity: 1,
        unitPrice: table.pricePerHour,
        totalPrice: hours * table.pricePerHour,
      };

      createInvoice(table.id, currentUser.id, [tableItem]);
      onClose();
    }
  };

  if (!session && table.status === 'in-use') {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
        <Card className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-0">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" /> Phiên chơi bị lỗi
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Bàn <span className="font-semibold text-slate-800">{table.name}</span> đang được sử dụng nhưng không thể tìm thấy thông tin phiên chơi. Vui lòng thử tải lại trang.
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl h-12">
              Đóng
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <Card className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-0 animate-in zoom-in-95 duration-300">
        <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-3xl overflow-hidden p-6 flex flex-col justify-end">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          <h2 className="text-3xl font-extrabold text-white relative z-10">{table.name}</h2>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-8">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                {table.status === 'available' ? <CheckCircle2 size={18} className="text-emerald-500" /> 
                 : table.status === 'in-use' ? <Play size={18} className="text-emerald-500" />
                 : <AlertTriangle size={18} className="text-amber-500" />}
                <span className="text-sm font-medium">Trạng thái</span>
              </div>
              <span className={`font-bold ${table.status === 'available' ? 'text-emerald-600' : table.status === 'in-use' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {table.status === 'available' ? 'Trống' : table.status === 'in-use' ? 'Đang sử dụng' : 'Bảo trì'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-lg font-medium">💵</span>
                <span className="text-sm font-medium">Đơn giá</span>
              </div>
              <span className="font-bold text-slate-800">
                {table.pricePerHour.toLocaleString('vi-VN')} đ/h
              </span>
            </div>

            {session && (
              <>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Clock size={18} />
                    <span className="text-sm font-medium">Bắt đầu</span>
                  </div>
                  <span className="font-bold text-emerald-900">
                    {new Date(session.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {session.endTime && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Square size={18} />
                      <span className="text-sm font-medium">Kết thúc</span>
                    </div>
                    <span className="font-bold text-emerald-900">
                      {new Date(session.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {!showPayment ? (
            <div className="flex flex-col gap-3">
              {table.status === 'available' && (
                <Button
                  onClick={handleStartSession}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-600/20"
                >
                  <Play size={20} className="mr-2" /> Bắt đầu chơi
                </Button>
              )}

              {session && !session.endTime && (
                <Button
                  onClick={handleEndSession}
                  className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-rose-500/20"
                >
                  <Square size={20} className="mr-2" /> Kết thúc chơi
                </Button>
              )}

              {table.status === 'maintenance' && (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-center font-medium">
                  Bàn đang bảo trì, không thể sử dụng
                </div>
              )}

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full h-12 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                Đóng cửa sổ
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                <Receipt className="mx-auto text-emerald-400 mb-2" size={32} />
                <p className="text-sm font-semibold text-emerald-900">
                  Bạn có muốn xuất hóa đơn cho phiên chơi này không?
                </p>
              </div>
              <Button
                onClick={handleCreateInvoice}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Tạo hóa đơn & Thanh toán
              </Button>
              <Button
                onClick={() => {
                  setShowPayment(false);
                  onClose();
                }}
                variant="ghost"
                className="w-full h-12 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                Hủy bỏ
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
