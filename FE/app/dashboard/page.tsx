'use client';

import { useData } from '@/lib/dataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleDollarSign, Gamepad2, ReceiptText, Activity, CheckCircle2, ArrowRight, Utensils } from 'lucide-react';

interface Stats {
  revenue: number;
  tablesInUse: number;
  totalInvoices: number;
  utilizationRate: number;
}

export default function DashboardPage() {
  const { getTodayRevenue, getTablesInUse, getTodayInvoices, tables } = useData();
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    tablesInUse: 0,
    totalInvoices: 0,
    utilizationRate: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const inUse = getTablesInUse();
      const rate = tables.length > 0 ? (inUse / tables.length) * 100 : 0;
      setStats({
        revenue: getTodayRevenue(),
        tablesInUse: inUse,
        totalInvoices: getTodayInvoices(),
        utilizationRate: Math.round(rate),
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, [getTodayRevenue, getTablesInUse, getTodayInvoices, tables]);

  const statCards = [
    {
      title: 'Tổng Doanh Thu',
      value: `${stats.revenue.toLocaleString('vi-VN')}đ`,
      subtitle: 'hôm nay',
      icon: <CircleDollarSign size={28} className="text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      glow: 'group-hover:shadow-emerald-500/20'
    },
    {
      title: 'Bàn Đang Sử Dụng',
      value: `${stats.tablesInUse}/${tables.length}`,
      subtitle: 'bàn chơi',
      icon: <Gamepad2 size={28} className="text-blue-600" />,
      iconBg: 'bg-blue-100',
      glow: 'group-hover:shadow-blue-500/20'
    },
    {
      title: 'Hóa Đơn Hôm Nay',
      value: stats.totalInvoices.toString(),
      subtitle: 'giao dịch',
      icon: <ReceiptText size={28} className="text-purple-600" />,
      iconBg: 'bg-purple-100',
      glow: 'group-hover:shadow-purple-500/20'
    },
    {
      title: 'Tỉ Lệ Sử Dụng',
      value: `${stats.utilizationRate}%`,
      subtitle: 'công suất',
      icon: <Activity size={28} className="text-amber-600" />,
      iconBg: 'bg-amber-100',
      glow: 'group-hover:shadow-amber-500/20'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-400 font-medium">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${stat.glow}`}
          >
            {/* Soft background glow on hover */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-slate-50 rounded-full blur-2xl transition-colors group-hover:bg-slate-100/50"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl ${stat.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.title}</p>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Quản lý Bàn', icon: <Gamepad2 size={24} className="text-blue-600" />, desc: 'Xem trạng thái bàn real-time, bắt đầu/kết thúc giờ chơi, tính toán tiền tự động', link: '/dashboard/tables', bg: 'bg-blue-50', border: 'group-hover:border-blue-200' },
          { title: 'Hóa Đơn', icon: <ReceiptText size={24} className="text-emerald-600" />, desc: 'Tạo hóa đơn mới, thêm dịch vụ, quản lý thanh toán và in biên lai', link: '/dashboard/invoices', bg: 'bg-emerald-50', border: 'group-hover:border-emerald-200' },
          { title: 'Dịch Vụ', icon: <Utensils size={24} className="text-amber-600" />, desc: 'Quản lý nước, đồ ăn, combo và các dịch vụ bổ sung khác', link: '/dashboard/services', bg: 'bg-amber-50', border: 'group-hover:border-amber-200' }
        ].map((action, idx) => (
          <Link href={action.link} key={idx} className="block group">
            <Card className={`h-full p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/80 rounded-2xl bg-white overflow-hidden relative ${action.border}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-500"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${action.bg} shadow-inner`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{action.title}</h3>
              </div>
              
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {action.desc}
              </p>
              
              <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                Truy cập ngay <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Features Overview */}
      <Card className="p-8 shadow-sm border-0 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/20">
              <Activity className="text-white" size={24} />
            </div>
            Tính Năng Hệ Thống
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Quản lý Real-time', desc: 'Cập nhật trạng thái bàn ngay lập tức trên tất cả thiết bị' },
              { title: 'Tính Toán Tự Động', desc: 'Hệ thống tự động tính tiền theo giờ chơi và dịch vụ đi kèm' },
              { title: 'Phân quyền chặt chẽ', desc: 'Quản lý Admin/Nhân viên, bảo mật dữ liệu tuyệt đối' },
              { title: 'Hóa Đơn Điện Tử', desc: 'Tạo, quản lý và thanh toán hóa đơn trực tuyến mượt mà' },
              { title: 'Menu Dịch Vụ', desc: 'Thêm menu nước, đồ ăn, combo vào hóa đơn vô cùng dễ dàng' },
              { title: 'Thống Kê Trực Quan', desc: 'Báo cáo doanh thu, công suất sử dụng rõ ràng trên Dashboard' }
            ].map((feat, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 bg-white/10 text-white border border-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-emerald-600 transition-all duration-300">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{feat.title}</p>
                  <p className="text-sm text-emerald-100 leading-relaxed group-hover:text-white transition-colors">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
