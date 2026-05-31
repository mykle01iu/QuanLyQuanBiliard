'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Section - Branding */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-emerald-700 to-green-600 p-12 rounded-l-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -z-10 blur-xl"></div>
          <div className="space-y-6 relative z-10">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm ring-4 ring-white/30 p-1">
              <img src="/logo.jpg" alt="Billiards Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-3 tracking-wide">99Billiards</h2>
              <p className="text-emerald-100 text-lg font-medium">Giải pháp quản lý quán billiards hiện đại và toàn diện</p>
            </div>
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <span className="text-white/90">Quản lý trạng thái bàn Real-time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <span className="text-white/90">Tính tiền tự động chính xác</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <span className="text-primary-foreground/90">Hóa đơn điện tử và thanh toán nhanh chóng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="bg-white p-8 md:p-12 rounded-r-2xl shadow-xl md:rounded-r-2xl rounded-2xl md:rounded-l-none">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Đăng Nhập</h1>
              <p className="text-muted-foreground mt-2">Nhập thông tin để truy cập hệ thống</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Tên đăng nhập
                </label>
                <Input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  required
                  className="h-11 border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                  className="h-11 border-border"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}
