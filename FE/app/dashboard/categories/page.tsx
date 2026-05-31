'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Category } from '@/lib/types';
import { Plus, Pencil, Trash2, AlertCircle, X, Package, Coffee, Utensils, Star, Heart, Flame, Zap } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Package: <Package size={20} />,
  Coffee: <Coffee size={20} />,
  Utensils: <Utensils size={20} />,
  Star: <Star size={20} />,
  Heart: <Heart size={20} />,
  Flame: <Flame size={20} />,
  Zap: <Zap size={20} />,
};

const COLORS = [
  { name: 'Xám', color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-100' },
  { name: 'Xanh dương', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
  { name: 'Xanh lá', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
  { name: 'Cam', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100' },
  { name: 'Tím', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100' },
  { name: 'Hồng', color: 'text-pink-600', bg: 'bg-pink-50', ring: 'ring-pink-100' },
  { name: 'Đỏ', color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-100' },
];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const { user: currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    icon: 'Package',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    ring: 'ring-slate-100'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategory({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      addCategory(formData);
    }
    setFormData({ name: '', icon: 'Package', color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-100' });
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setFormData({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      bg: cat.bg,
      ring: cat.ring
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xác nhận xóa danh mục này? Các dịch vụ thuộc danh mục sẽ chuyển thành "Khác"')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Danh mục dịch vụ</h1>
          <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{categories.length} mục</span>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', icon: 'Package', color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-100' });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 font-semibold shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Thêm danh mục
          </Button>
        )}
      </div>

      {/* Form Modal */}
      {mounted && showForm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 shadow-2xl border-0 ring-1 ring-slate-200/50 rounded-2xl bg-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên danh mục</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Thuốc lá, Phụ kiện, Nước ép..." className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
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

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${cat.bg} ring-1 ${cat.ring}`}>
                <div className={cat.color}>{ICONS[cat.icon] || <Package size={20} />}</div>
              </div>
              <h3 className="font-bold text-lg text-slate-800">{cat.name}</h3>
            </div>
            
            <div className="mt-auto flex gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleEdit(cat)}
                className="flex-1 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Pencil size={14} /> Sửa
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="flex-1 h-9 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!
          </div>
        )}
      </div>
    </div>
  );
}
