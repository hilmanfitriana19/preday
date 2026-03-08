'use client';

import { LayoutDashboard, History, User, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen sticky top-0 flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Send className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground transition-colors px-1">PredaY</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
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

      <div className="p-6 border-t border-border">
        <div className="bg-muted p-4 rounded-xl border border-border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Pro Plan</p>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-primary rounded-full" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">75% of alerts used</p>
        </div>
      </div>
    </aside>
  );
}
