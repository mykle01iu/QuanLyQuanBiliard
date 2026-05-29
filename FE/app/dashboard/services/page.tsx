'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Service } from '@/lib/types';
import { Coffee, Utensils, Package, Plus, Pencil, Trash2, AlertCircle, X } from 'lucide-react';

export default function ServicesPage() {
  const { services, addService, updateService, deleteService } = useData();
  const { user: currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'drink' as 'drink' | 'food' | 'combo',
    price: 0,
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="bg-rose-50 border border-rose-200 p-8 rounded-2xl max-w-md text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-800 mb-1">Truy cập bị từ chối</h2>
          <p className="text-sm text-rose-600">Chỉ Admin mới có quyền quản lý dịch vụ.</p>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateService({ ...formData, id: editingId } as Service);
      setEditingId(null);
    } else {
      const newService: Service = { ...formData, id: `service-${Date.now()}` } as Service;
      addService(newService);
    }
    setFormData({ id: '', name: '', category: 'drink', price: 0, description: '' });
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setFormData({ id: service.id, name: service.name, category: service.category, price: service.price, description: service.description || '' });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xác nhận xóa dịch vụ này?')) deleteService(id);
  };

  const groupedServices = {
    drink: services.filter((s) => s.category === 'drink'),
    food: services.filter((s) => s.category === 'food'),
    combo: services.filter((s) => s.category === 'combo'),
  };

  const categoryConfig = {
    drink: { icon: <Coffee size={20} />, label: 'Đồ uống', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
    food: { icon: <Utensils size={20} />, label: 'Đồ ăn', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
    combo: { icon: <Package size={20} />, label: 'Combo', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Dịch vụ</h1>
          <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{services.length} mục</span>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ id: '', name: '', category: 'drink', price: 0, description: '' });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 font-semibold shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Thêm mới
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 shadow-lg border-0 ring-1 ring-slate-200 rounded-2xl bg-white animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              {editingId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên dịch vụ</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Bia Tiger" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá (VND)</label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} min="0" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'drink' | 'food' | 'combo' })}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="drink">Đồ uống</option>
                  <option value="food">Đồ ăn</option>
                  <option value="combo">Combo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả</label>
                <Input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tùy chọn..." className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 px-6 rounded-xl shadow-sm">
                {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
              <Button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} variant="outline" className="h-11 px-6 rounded-xl font-semibold text-slate-500">
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories */}
      <div className="space-y-10">
        {(Object.keys(groupedServices) as Array<'drink' | 'food' | 'combo'>).map((category) => {
          const config = categoryConfig[category];
          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl ${config.bg} ring-1 ${config.ring}`}>
                  <div className={config.color}>{config.icon}</div>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{config.label}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{groupedServices[category].length}</span>
                <div className="h-px flex-1 bg-slate-100 ml-2"></div>
              </div>

              {groupedServices[category].length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <p className="text-sm text-slate-400">Chưa có dịch vụ nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedServices[category].map((service) => (
                    <Card key={service.id} className="group p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                      <div className="mb-3">
                        <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{service.description}</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="text-2xl font-extrabold text-slate-900">
                          {service.price.toLocaleString('vi-VN')}<span className="text-sm font-bold text-slate-400">đ</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Pencil size={13} /> Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
