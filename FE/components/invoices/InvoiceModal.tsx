'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { InvoiceItem } from '@/lib/types';

interface InvoiceModalProps {
  onClose: () => void;
}

export default function InvoiceModal({ onClose }: InvoiceModalProps) {
  const { tables, sessions, services, createInvoice } = useData();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const inUseTables = tables.filter((t) => t.status === 'in-use');
  const session = selectedTable ? sessions.find((s) => s.tableId === selectedTable && !s.endTime) : null;

  const handleAddService = () => {
    if (!selectedService || !quantity) return;

    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      type: 'service',
      name: service.name,
      quantity,
      unitPrice: service.price,
      totalPrice: service.price * quantity,
    };

    setItems([...items, newItem]);
    setSelectedService('');
    setQuantity(1);
  };

  const handleAddTableFee = () => {
    if (!selectedTable || !session) return;

    const table = tables.find((t) => t.id === selectedTable);
    if (!table) return;

    const now = new Date();
    const start = new Date(session.startTime);
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));

    const tableItem: InvoiceItem = {
      id: `item-table-${Date.now()}`,
      type: 'table',
      name: `${table.name} - ${hours} giờ`,
      quantity: 1,
      unitPrice: table.pricePerHour,
      totalPrice: hours * table.pricePerHour,
    };

    // Remove old table fee if exists
    const filteredItems = items.filter((item) => item.type !== 'table');
    setItems([...filteredItems, tableItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCreateInvoice = () => {
    if (!selectedTable || !user) return;

    // Add table fee if not already added
    if (!items.some((item) => item.type === 'table') && session) {
      const table = tables.find((t) => t.id === selectedTable);
      if (table) {
        const now = new Date();
        const start = new Date(session.startTime);
        const diffMs = now.getTime() - start.getTime();
        const hours = Math.ceil(diffMs / (1000 * 60 * 60));

        const tableItem: InvoiceItem = {
          id: `item-table-${Date.now()}`,
          type: 'table',
          name: `${table.name} - ${hours} giờ`,
          quantity: 1,
          unitPrice: table.pricePerHour,
          totalPrice: hours * table.pricePerHour,
        };

        items.push(tableItem);
      }
    }

    if (items.length === 0) {
      alert('Vui lòng thêm dịch vụ hoặc tiền bàn');
      return;
    }

    createInvoice(selectedTable, user.id, items);
    onClose();
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tạo hóa đơn mới</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Table Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn bàn
              </label>
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  setItems([]);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">-- Chọn bàn --</option>
                {inUseTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTable && (
              <>
                {/* Add Table Fee Button */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Thêm tiền bàn
                      </p>
                      <p className="text-xs text-blue-700">
                        Tính dựa trên thời gian chơi
                      </p>
                    </div>
                    <Button
                      onClick={handleAddTableFee}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      Thêm tiền bàn
                    </Button>
                  </div>
                </div>

                {/* Add Services */}
                <div className="border border-gray-200 rounded p-4">
                  <p className="text-sm font-medium text-gray-800 mb-3">
                    Thêm dịch vụ
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} ({(service.price / 1000).toFixed(0)}k)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-20 border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                      <Button
                        onClick={handleAddService}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4"
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">
                            Mục
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-700">
                            SL
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-700">
                            Đơn giá
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-700">
                            Thành tiền
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">
                            Xóa
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-800">{item.name}</td>
                            <td className="px-4 py-2 text-right text-gray-600">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-600">
                              {item.unitPrice.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-800">
                              {item.totalPrice.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                onClick={() => handleRemoveItem(item.id)}
                                size="sm"
                                className="bg-red-50 text-red-600 hover:bg-red-100 text-xs"
                              >
                                Xóa
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Total Amount */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-blue-900">Tổng cộng:</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalAmount.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={items.length === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    Tạo hóa đơn
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
