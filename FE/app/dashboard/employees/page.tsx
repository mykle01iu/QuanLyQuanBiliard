'use client';

import { useData } from '@/lib/dataContext';
import { useAuth } from '@/lib/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Shield, UserCircle, X, AlertCircle, Users, Mail, Phone } from 'lucide-react';

export default function EmployeesPage() {
  const { users, addUser, updateUser, deleteUser } = useData();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'staff' as UserRole,
    salary: 50000,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="bg-rose-50 border border-rose-200 p-8 rounded-2xl max-w-md text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-800 mb-1">Truy cập bị từ chối</h2>
          <p className="text-sm text-rose-600">Chỉ Admin mới có quyền quản lý nhân viên.</p>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateUser({
        ...formData,
        id: editingId,
        createdAt: users.find((u) => u.id === editingId)?.createdAt || new Date(),
      });
      setEditingId(null);
    } else {
      const newUser: User = {
        ...formData,
        id: `user-${Date.now()}`,
        createdAt: new Date(),
      };
      addUser(newUser);
    }
    setFormData({ id: '', name: '', email: '', phone: '', role: 'staff', salary: 50000 });
    setShowForm(false);
  };

  const handleEdit = (u: User) => {
    setFormData({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, salary: u.salary });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xác nhận xóa nhân viên này?')) {
      deleteUser(id);
    }
  };

  const admins = users.filter(u => u.role === 'admin');
  const staffs = users.filter(u => u.role === 'staff');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Nhân viên</h1>
          <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{users.length} người</span>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ id: '', name: '', email: '', phone: '', role: 'staff', salary: 50000 });
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
              {editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ tên</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nguyễn Văn A" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="nguyenvana@email.com" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0912345678" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lương (VND/giờ)</label>
                <Input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })} min="0" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Admin</option>
                </select>
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

      {/* Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {users.map((employee) => (
          <Card key={employee.id} className="group p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${
                  employee.role === 'admin' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {employee.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{employee.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-0.5 ${
                    employee.role === 'admin' ? 'text-emerald-600' : 'text-blue-600'
                  }`}>
                    <Shield size={10} />
                    {employee.role === 'admin' ? 'Admin' : 'Nhân viên'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail size={13} className="text-slate-400" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={13} className="text-slate-400" />
                <span>{employee.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">{employee.salary.toLocaleString('vi-VN')}đ<span className="text-slate-400 font-normal">/giờ</span></p>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(employee)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(employee.id)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
