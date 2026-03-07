'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Login from '@/components/auth/Login';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import Header from '@/components/common/Header';
import LandingPage from '@/components/home/LandingPage';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <div className="relative">
          <div className="absolute top-4 left-4 z-50">
            <button 
              onClick={() => setShowLogin(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
            >
              &larr; Back to Home
            </button>
          </div>
          <Login />
        </div>
      );
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
}
