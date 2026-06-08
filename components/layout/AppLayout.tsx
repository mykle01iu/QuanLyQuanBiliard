'use client';

import { useAuth } from '@/lib/authContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, Gamepad2, Utensils, Users, ReceiptText, LogOut, ChevronLeft, ChevronRight, Package } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/dashboard/tables', label: 'Quản lý bàn', icon: <Gamepad2 size={20} /> },
  { href: '/dashboard/categories', label: 'Danh mục', icon: <Package size={20} /> },
  { href: '/dashboard/services', label: 'Dịch vụ', icon: <Utensils size={20} /> },
  { href: '/dashboard/employees', label: 'Nhân viên', icon: <Users size={20} />, requiredRole: 'admin' },
  { href: '/dashboard/invoices', label: 'Hóa đơn', icon: <ReceiptText size={20} /> },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          Đang tải...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.requiredRole || item.requiredRole === user.role
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? 'w-64' : 'w-20'
          } bg-emerald-900 text-slate-100 transition-all duration-300 flex flex-col shadow-xl relative z-10`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 px-6 bg-emerald-900/80">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center p-0.5 overflow-hidden ring-2 ring-emerald-500/50">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-extrabold tracking-wide"><span className="text-emerald-400">99</span><span className="text-white">Billiards</span></span>)}
        </div>

        <nav className="flex flex-1 flex-col mt-6 px-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon; // Assuming it's already a ReactNode, we might just render it directly
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200
                      ${isActive
                        ? 'bg-emerald-500/30 text-emerald-300 shadow-sm'
                        : 'text-emerald-200/60 hover:text-white hover:bg-emerald-900/50'
                      }
                    `}
                  >
                    <div className={`shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-200/60 group-hover:text-white'}`}>
                      {item.icon}
                    </div>
                    {isSidebarOpen && item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-emerald-900 space-y-4 bg-emerald-900/50">
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-emerald-900 border border-emerald-800 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
              {user.name.substring(0, 1).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-emerald-50 truncate">{user.name}</p>
                <p className="text-xs text-emerald-300/70">{user.role === 'admin' ? 'Administrator' : 'Staff Member'}</p>
              </div>
            )}
          </div>

          <div className={`flex ${isSidebarOpen ? 'gap-2' : 'flex-col gap-2'}`}>
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="outline"
              className={`border-emerald-800 bg-transparent text-emerald-200/70 hover:bg-emerald-900 hover:text-white flex-1 ${!isSidebarOpen && 'h-10 px-0'}`}
              title="Thu gọn"
            >
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
            <Button
              onClick={handleLogout}
              className={`bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 ${isSidebarOpen ? 'flex-[2]' : 'h-10 px-0'}`}
              title="Đăng xuất"
            >
              <LogOut size={18} className={isSidebarOpen ? "mr-2" : ""} />
              {isSidebarOpen && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        <main id="main-scroll-area" className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
