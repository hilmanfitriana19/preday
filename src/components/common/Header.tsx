'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { CreateReminderDialog } from '@/components/dashboard/CreateReminderDialog';
import { useEffect, useState } from 'react';

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('preday_view');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border transition-colors duration-300">
      <div className="flex h-20 items-center justify-between px-8">
        <div className="font-bold text-2xl tracking-tight text-foreground">
          PredaY
        </div>
        <div className="flex items-center gap-6">
          <CreateReminderDialog />
          
          <div className="h-8 w-px bg-border" />
          
          <div className="flex items-center gap-4">
            {!mounted ? (
              <div className="h-9 w-9" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            
            {user && (
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-border h-8">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-bold text-foreground leading-tight">Logged in as</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
