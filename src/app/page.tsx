'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Login from '@/components/auth/Login';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import Header from '@/components/common/Header';
import LandingPage from '@/components/home/LandingPage';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import ProfileView from '@/components/dashboard/ProfileView';

export default function Home() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  // Check for persisted view preference on mount
  useEffect(() => {
    const savedView = localStorage.getItem('preday_view');
    if (savedView === 'dashboard') {
      setShowDashboard(true);
    }
  }, []);

  const handleEnterDashboard = () => {
    setShowDashboard(true);
    localStorage.setItem('preday_view', 'dashboard');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user is not logged in
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

  // If user is logged in but hasn't explicitly clicked "Go to Dashboard"
  if (!showDashboard) {
    return <LandingPage onLoginClick={handleEnterDashboard} />;
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-8 py-8 w-full max-w-7xl mx-auto">
          {user.role === 'admin' ? (
            <AdminDashboard />
          ) : activeView === 'profile' ? (
            <ProfileView />
          ) : (
            <UserDashboard 
              initialTab={activeView === 'history' ? 'history' : 'upcoming'} 
              onTabChange={(tab) => setActiveView(tab === 'history' ? 'history' : 'dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
