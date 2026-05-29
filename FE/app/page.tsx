'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function Page() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-2xl font-semibold">Đang tải...</div>
      </div>
    );
  }

  return <LoginForm />;
}
