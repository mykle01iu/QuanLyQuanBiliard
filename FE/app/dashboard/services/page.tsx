'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Service, Category } from '@/lib/types';
import { Plus, Pencil, Trash2, AlertCircle, X, Package, Coffee, Utensils, Star, Heart, Flame, Zap, Image as ImageIcon } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Package: <Package size={20} />,
  Coffee: <Coffee size={20} />,
  Utensils: <Utensils size={20} />,
  Star: <Star size={20} />,
  Heart: <Heart size={20} />,
  Flame: <Flame size={20} />,
  Zap: <Zap size={20} />,
};

export default function ServicesPage() {
  const { services, categories, addService, updateService, deleteService } = useData();
  const { user: currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: categories.length > 0 ? categories[0].name : 'Khác',
    price: 0,
    description: '',
    image_url: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateService({ ...formData, id: editingId } as Service);
      setEditingId(null);
    } else {
      const newService: Service = { ...formData, id: `service-${Date.now()}` } as Service;
      addService(newService);
    }
    setFormData({ id: '', name: '', category: categories.length > 0 ? categories[0].name : 'Khác', price: 0, description: '', image_url: '' });
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setFormData({ 
      id: service.id, 
      name: service.name, 
      category: service.category, 
      price: service.price, 
      description: service.description || '',
      image_url: service.image_url || ''
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xác nhận xóa dịch vụ này?')) deleteService(id);
  };

  // Group services by category
  const groupedServices: Record<string, Service[]> = {};
  categories.forEach(cat => {
    groupedServices[cat.name] = [];
  });
  groupedServices['Khác'] = [];

  services.forEach(service => {
    const catName = service.category;
    if (groupedServices[catName]) {
      groupedServices[catName].push(service);
    } else {
      groupedServices['Khác'].push(service);
    }
  });

  const getCategoryConfig = (catName: string): Category => {
    const cat = categories.find(c => c.name === catName);
    if (cat) return cat;
    return { id: 'unknown', name: catName, icon: 'Package', color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-100' };
  };

  return (
    <div className="space-y-8">
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
              setFormData({ id: '', name: '', category: categories.length > 0 ? categories[0].name : 'Khác', price: 0, description: '', image_url: '' });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 font-semibold shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Thêm mới
          </Button>
        )}
      </div>

      {/* Form Modal */}
      {mounted && showForm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-xl p-6 shadow-2xl border-0 ring-1 ring-slate-200/50 rounded-2xl bg-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả</label>
                  <Input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tùy chọn..." className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL Hình ảnh</label>
                  <Input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0 mt-6">
                <Button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} variant="outline" className="flex-1 h-11 rounded-xl font-semibold text-slate-500">
                  Hủy
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl shadow-sm">
                  {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </Card>
        </div>,
        document.body
      )}

      {/* Categories */}
      <div className="space-y-10">
        {Object.keys(groupedServices).map((categoryName) => {
          const servicesList = groupedServices[categoryName];
          if (servicesList.length === 0 && categoryName === 'Khác') return null;
          if (servicesList.length === 0 && categories.length > 0) return null; // Only show non-empty or let it show empty if needed

          const config = getCategoryConfig(categoryName);
          
          // Only show empty categories if it's not 'Khác'
          if (servicesList.length === 0 && categoryName !== 'Khác') {
             return (
              <div key={categoryName}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-xl ${config.bg} ring-1 ${config.ring}`}>
                    <div className={config.color}>{ICONS[config.icon] || <Package size={20} />}</div>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{config.name}</h2>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">0</span>
                  <div className="h-px flex-1 bg-slate-100 ml-2"></div>
                </div>
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <p className="text-sm text-slate-400">Chưa có dịch vụ nào</p>
                </div>
              </div>
             );
          }

          return (
            <div key={categoryName}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl ${config.bg} ring-1 ${config.ring}`}>
                  <div className={config.color}>{ICONS[config.icon] || <Package size={20} />}</div>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{config.name}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{servicesList.length}</span>
                <div className="h-px flex-1 bg-slate-100 ml-2"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {servicesList.map((service) => (
                  <Card key={service.id} className="group flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                    {service.image_url ? (
                      <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
                        <img src={service.image_url} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 right-4">
                           <h3 className="font-bold text-white text-lg line-clamp-1">{service.name}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 pb-0">
                         <div className="flex items-start justify-between mb-2">
                           <div className={`p-2 rounded-lg ${config.bg} ${config.color} mb-3`}>
                             {ICONS[config.icon] || <Package size={16} />}
                           </div>
                         </div>
                         <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
                           {service.name}
                         </h3>
                      </div>
                    )}
                    
                    <div className="p-5 flex-1 flex flex-col">
                      {service.description && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
                      )}

                      <div className="mt-auto pt-2">
                        <p className="text-2xl font-extrabold text-slate-900 mb-4">
                          {service.price.toLocaleString('vi-VN')}<span className="text-sm font-bold text-slate-400">đ</span>
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="flex-1 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Pencil size={13} /> Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="flex-1 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
