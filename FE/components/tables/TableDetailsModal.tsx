'use client';

import { PoolTable, User, InvoiceItem } from '@/lib/types';
import { useData } from '@/lib/dataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InvoiceDetailsModal from '@/components/invoices/InvoiceDetailsModal';
import { CheckCircle2, Play, Square, X, Clock, Receipt, AlertTriangle, Pencil, Trash2, Coffee, Plus } from 'lucide-react';

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
  const { 
    startTableSession, 
    endTableSession, 
    getTableSession, 
    createInvoice, 
    editTable, 
    deleteTable,
    services,
    addServiceToActiveTable,
    invoices,
    updateTableStatus
  } = useData();

  const session = getTableSession(table.id);
  const pendingInvoice = invoices.find((inv) => inv.tableId === table.id && inv.status === 'pending');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Admin edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(table.name);
  const [editPrice, setEditPrice] = useState(table.pricePerHour);
  const [editStatus, setEditStatus] = useState<PoolTable['status']>(table.status);

  // Service order states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingService, setIsAddingService] = useState(false);

  const handleStartSession = () => {
    if (currentUser) {
      startTableSession(table.id, currentUser.id);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleEndSession = () => {
    if (session && pendingInvoice) {
      setShowInvoiceModal(true);
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

  const handleAddService = async () => {
    if (!selectedService || quantity <= 0) return;
    setIsAddingService(true);
    try {
      await addServiceToActiveTable(table.id, selectedService, quantity);
      setShowServiceForm(false);
      setSelectedService('');
      setQuantity(1);
    } catch (err) {
      alert('Không thể thêm dịch vụ. Vui lòng thử lại.');
    } finally {
      setIsAddingService(false);
    }
  };

  const handleStartEdit = () => {
    setEditName(table.name);
    setEditPrice(table.pricePerHour);
    setEditStatus(table.status);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;
    editTable(table.id, editName, editPrice, editStatus !== 'in-use' ? editStatus : undefined);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${table.name}?`)) {
      deleteTable(table.id);
      onClose();
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!mounted) return null;

  if (isEditing) {
    return createPortal(
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
        <Card className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-0 animate-in zoom-in-95 duration-300 overflow-hidden">
          <div className="relative h-24 bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Chỉnh sửa {table.name}</h2>
            <button onClick={() => setIsEditing(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên bàn</label>
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá thuê (VND/giờ)</label>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                min="0"
                required
                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                disabled={table.status === 'in-use'}
                className="w-full h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white px-3 text-sm text-slate-700"
              >
                <option value="available">Trống</option>
                {table.status === 'in-use' && <option value="in-use">Đang sử dụng</option>}
                <option value="maintenance">Bảo trì</option>
              </select>
              {table.status === 'in-use' && (
                <p className="text-xs text-amber-500 mt-1">Không thể đổi trạng thái khi đang có khách</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl">
                Lưu lại
              </Button>
              <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="flex-1 h-11 rounded-xl font-semibold text-slate-500">
                Quay lại
              </Button>
            </div>
          </form>
        </Card>
      </div>,
      document.body
    );
  }

  if (!session && table.status === 'in-use') {
    return createPortal(
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
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
      <Card className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto border-0 animate-in zoom-in-95 duration-300">
        <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-3xl overflow-hidden p-6 flex flex-col justify-end">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <h2 className="text-3xl font-extrabold text-white relative z-10">{table.name}</h2>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
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

          {session && !session.endTime && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Coffee size={18} className="text-amber-600" /> Dịch vụ đã gọi
                </h3>
                {!showServiceForm && (
                  <button 
                    onClick={() => setShowServiceForm(true)}
                    className="text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Thêm đồ
                  </button>
                )}
              </div>

              {session.items && session.items.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-2">
                  {session.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.unitPrice.toLocaleString('vi-VN')}đ x {item.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-800">{item.totalPrice.toLocaleString('vi-VN')}đ</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-3 text-slate-400 text-sm">
                  Chưa gọi dịch vụ nào
                </div>
              )}

              {showServiceForm && (
                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white"
                    >
                      <option value="">-- Chọn món --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {(s.price / 1000).toFixed(0)}k</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 h-auto border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddService} 
                      disabled={!selectedService || isAddingService}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-9 rounded-lg shadow-sm"
                    >
                      {isAddingService ? 'Đang thêm...' : 'Xác nhận'}
                    </Button>
                    <Button 
                      onClick={() => setShowServiceForm(false)} 
                      variant="outline" 
                      className="flex-1 h-9 rounded-lg"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
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
              </div>

          {/* Admin Actions Section inside Modal */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Thao tác Admin</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartEdit}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Pencil size={15} /> Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  disabled={table.status === 'in-use'}
                  className={`h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    table.status === 'in-use'
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                  }`}
                >
                  <Trash2 size={15} /> Xóa bàn
                </button>
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full h-12 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 mt-2"
          >
            Đóng cửa sổ
          </Button>
          <div className="h-2"></div>
          </div>
        </div>
      </Card>

      {showInvoiceModal && pendingInvoice && (
        <InvoiceDetailsModal
          invoice={pendingInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            onClose(); // Close Table details as well after checkout
          }}
        />
      )}
    </div>,
    document.body
  );
}
