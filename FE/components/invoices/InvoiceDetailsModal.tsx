'use client';

import { Invoice } from '@/lib/types';
import { useData } from '@/lib/dataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Clock, Banknote, CreditCard, Receipt } from 'lucide-react';

interface InvoiceDetailsModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceDetailsModal({
  invoice,
  onClose,
}: InvoiceDetailsModalProps) {
  const { payInvoice, users, tables } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const staff = users.find((u) => u.id === invoice.staffId);
  const tableName = tables.find((t) => t.id === invoice.tableId)?.name || `Bàn ${invoice.tableId}`;

  const handlePayment = (method: 'cash' | 'card') => {
    payInvoice(invoice.id, method);
    onClose();
  };

  if (!invoice || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            overflow: visible;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <Card id="invoice-print-area" className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto border-0 animate-in zoom-in-95 duration-300">
        <div className="relative h-24 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-3xl overflow-hidden p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm text-white">
              <Receipt size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Chi tiết hóa đơn</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors no-print relative z-10"
          >
            <X size={18} />
          </button>
          
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        <div className="p-8">
          <div className="space-y-8">
            {/* Invoice Header */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mã hóa đơn</p>
                  <p className="font-bold text-slate-800">#{invoice.id.substring(0, 6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ngày tạo</p>
                  <p className="font-bold text-slate-800">
                    {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {staff?.name && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Thu ngân</p>
                    <p className="font-bold text-slate-800">{staff.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bàn</p>
                  <p className="font-bold text-slate-800">{tableName}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-600">Dịch vụ</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-600">SL</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600">Đơn giá</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {item.unitPrice.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {item.totalPrice.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100/50 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <p className="text-emerald-900/70 font-bold uppercase tracking-wider">Tổng cộng</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-extrabold text-emerald-700">
                    {invoice.totalAmount.toLocaleString('vi-VN')}
                  </p>
                  <span className="text-lg font-bold text-emerald-700/60">VND</span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Trạng thái thanh toán</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${
                      invoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {invoice.status === 'paid' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </div>
              </div>
              
              {invoice.status === 'paid' && invoice.paidAt && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Thanh toán lúc</p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(invoice.paidAt).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize font-medium">
                    Phương thức: <span className="font-bold">{invoice.paymentMethod === 'card' ? 'Chuyển khoản / Thẻ' : 'Tiền mặt'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2 no-print">
              {invoice.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handlePayment('cash')}
                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-base"
                  >
                    <Banknote size={20} className="mr-2" /> Tiền mặt
                  </Button>
                  <Button
                    onClick={() => handlePayment('card')}
                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-base"
                  >
                    <CreditCard size={20} className="mr-2" /> Chuyển khoản
                  </Button>
                </>
              )}
              {invoice.status === 'paid' && (
                <Button
                  variant="outline"
                  className="flex-1 h-14 font-bold rounded-xl text-base text-slate-600 border-slate-200 hover:bg-slate-50"
                  onClick={() => {
                    window.print();
                  }}
                >
                  <Receipt size={20} className="mr-2" /> In biên lai
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                className="h-14 px-8 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  );
}
