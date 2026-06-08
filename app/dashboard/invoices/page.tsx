'use client';

import { useData } from '@/lib/dataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import InvoiceModal from '@/components/invoices/InvoiceModal';
import InvoiceDetailsModal from '@/components/invoices/InvoiceDetailsModal';
import { Invoice } from '@/lib/types';
import { Plus, CircleDollarSign, CheckCircle2, Clock, Eye, CreditCard, Receipt } from 'lucide-react';

export default function InvoicesPage() {
  const { invoices, payInvoice, tables } = useData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending');
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const filters = [
    { key: 'all' as const, label: 'Tất cả', count: invoices.length },
    { key: 'pending' as const, label: 'Chờ thanh toán', count: pendingInvoices.length },
    { key: 'paid' as const, label: 'Đã thanh toán', count: paidInvoices.length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Hóa đơn</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 font-semibold shadow-sm"
        >
          <Plus size={16} className="mr-2" /> Tạo hóa đơn
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50">
              <CircleDollarSign size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu</p>
              <p className="text-2xl font-extrabold text-slate-900">{totalRevenue.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50">
              <CheckCircle2 size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã thanh toán</p>
              <p className="text-2xl font-extrabold text-slate-900">{paidInvoices.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50">
              <Clock size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chờ thanh toán</p>
              <p className="text-2xl font-extrabold text-slate-900">{pendingInvoices.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === f.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label} <span className="ml-1 text-xs opacity-60">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <Card className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <Receipt size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Không có hóa đơn nào</p>
        </Card>
      ) : (
        <Card className="bg-white overflow-hidden shadow-sm border border-slate-200/80 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Mã HĐ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Bàn</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Dịch vụ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        #{invoice.id.substring(0, 6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {tables.find(t => t.id === invoice.tableId)?.name || `Bàn ${invoice.tableId}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {invoice.items.length} mục
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                      {invoice.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4">
                      {invoice.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50">
                          <CheckCircle2 size={12} /> Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200/50">
                          <Clock size={12} /> Chờ thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                          title="Chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => payInvoice(invoice.id, 'cash')}
                            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <CreditCard size={13} /> Thanh toán
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals */}
      {showCreateModal && <InvoiceModal onClose={() => setShowCreateModal(false)} />}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
