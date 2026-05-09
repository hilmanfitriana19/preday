'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { navItems } from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function Header({ activeView, onViewChange }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
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
      <div className="flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          {user && onViewChange && (
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 border-r border-border bg-sidebar transition-colors duration-300">
                  <div className="p-6 flex items-center gap-3 border-b border-border/50">
                    <div className="h-10 w-10 flex items-center justify-center">
                      <Image 
                        src="/preday/logo.png" 
                        alt="PredaY Logo" 
                        width={40} 
                        height={40} 
                        className="object-contain"
                      />
                    </div>
                    <SheetTitle className="font-bold text-lg tracking-tight text-foreground transition-colors px-1 text-left">PredaY</SheetTitle>
                  </div>
                  
                  <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onViewChange(item.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                          activeView === item.id 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                          activeView === item.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-medium">{item.label}</span>
                        {activeView === item.id && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,136,204,0.6)]" />
                        )}
                      </button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center">
              <Image 
                src="/preday/logo.png" 
                alt="PredaY Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              PredaY
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          
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
              <div className="flex items-center gap-2 md:gap-4 md:ml-2 md:pl-4 md:border-l md:border-border h-8">
                <div className="hidden md:flex flex-col items-end">
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
