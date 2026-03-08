'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BellOff, ArrowRight, Zap, CheckCircle2, Database, Send, MousePointer2, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 selection:bg-primary/30 antialiased overflow-x-hidden",
      isDark ? "dark bg-[#0B0B0C] text-white" : "bg-[#F8FAFC] text-[#1E293B]"
    )}>
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px]",
          isDark ? "bg-primary/10" : "bg-primary/5"
        )} />
        <div className={cn(
          "absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full blur-[100px]",
          isDark ? "bg-primary/5" : "bg-primary/5"
        )} />
      </div>

      <header className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-500 h-20 flex items-center",
        isDark ? "border-white/5 bg-[#0B0B0C]/80" : "border-zinc-200 bg-white/80"
      )}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8">
          <div className="font-bold text-xl tracking-tighter flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Send className="h-5 w-5 text-white" />
            </div>
            <span className={isDark ? "text-white" : "text-[#1E293B]"}>PredaY</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className={cn(
                "text-sm font-medium transition-colors",
                isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-600 hover:text-[#1E293B] hover:bg-zinc-100"
              )} 
              aria-label="Sign in to your account"
              onClick={onLoginClick}
            >
              Sign In
            </Button>
            
            <div className={cn("h-6 w-px mx-2", isDark ? "bg-white/10" : "bg-zinc-200")} />
            
            {!mounted ? (
              <div className="h-9 w-9" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl transition-all",
                  isDark ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-600 hover:text-[#1E293B] hover:bg-zinc-100"
                )}
                onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            <Button 
              aria-label={user ? "Go to your dashboard" : "Get started with PredaY"}
              className={cn(
                "bg-primary hover:bg-primary/90 text-white shadow-lg px-6 rounded-xl hidden sm:flex transition-all",
                isDark ? "shadow-primary/25" : "shadow-primary/20 hover:-translate-y-0.5"
              )}
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Section 1: Hero */}
        <section className="max-w-7xl mx-auto px-8 py-24 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider",
              isDark ? "bg-primary/10 border-primary/20 text-primary" : "bg-primary/5 border-primary/10 text-primary"
            )}>
              <Zap className="h-3 w-3" /> Redesigned for n8n Power Users
            </div>
            <div className="space-y-4">
              <p className="text-primary font-bold tracking-[0.2em] text-xs uppercase animate-[shimmer_2s_infinite] bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
                Your H-1 Buffer &bull; Yo!
              </p>
              <h1 className={cn(
                "text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]",
                isDark ? "text-white" : "text-[#1E293B]"
              )}>
                Don&apos;t let your <br />
                <span className={isDark ? "text-gradient-blue" : "bg-clip-text text-transparent bg-gradient-to-r from-[#0088CC] to-[#005580]"}>
                  day slip away.
                </span>
              </h1>
            </div>
            <p className={cn(
              "text-lg max-w-xl leading-relaxed",
              isDark ? "text-zinc-400" : "text-[#64748B]"
            )}>
              The ultimate centralized control center for your Telegram alerts. Synced with Firebase, powered by n8n, and designed for reliability.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className={cn(
                    "h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl transition-all hover:scale-105 active:scale-95",
                    isDark ? "shadow-primary/20" : "shadow-primary/30 dark-drop-shadow" // Added custom shadow logic for light mode
                  )} 
                  aria-label={user ? "Navigate to Dashboard" : "Get started for free"}
                  onClick={onLoginClick}
                >
                  {user ? "Go to Dashboard" : "Get Started for Free"} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative h-[400px] w-[400px] md:h-[500px] md:w-[500px] animate-float">
              {/* Radial Blur Backlight */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-[80px]",
                isDark ? "bg-primary/20" : "bg-primary/10"
              )} />
              <Image 
                src="/landing/telegram_hero.png" 
                alt="3D Telegram Icon" 
                fill 
                className={cn(
                  "object-contain transition-all duration-700",
                  isDark ? "glow-blue brightness-110" : "brightness-100 drop-shadow-2xl" // Enhanced inner shadows conceptually via filter
                )}
                priority
              />
            </div>
          </div>
        </section>

        {/* Section 2: Feature Grid (Bento) */}
        <section className="max-w-7xl mx-auto px-8 py-24 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className={cn("text-3xl md:text-5xl font-bold tracking-tight", isDark ? "text-white" : "text-[#1E293B]")}>Built for Precision</h2>
            <p className={isDark ? "text-zinc-400" : "text-[#64748B]"}>Every feature crafted to give you total control over how your alerts are delivered.</p>
          </div>
          
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bento-card flex flex-col justify-between overflow-hidden relative group">
              <div className="space-y-4 relative z-10">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", isDark ? "bg-primary/10 border-primary/20 text-primary" : "bg-primary/5 border-primary/10 text-[#005580]")}>
                  <Database className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-[#1E293B]")}>n8n & Firebase Integration</h3>
                  <p className={cn("text-sm max-w-md", isDark ? "text-zinc-400" : "text-[#64748B]")}>Seamlessly bridge your automated workflows with real-time Firestore storage and instant Telegram notifications.</p>
                </div>
              </div>
              
              {/* Integration Diagram Mockup */}
              <div className={cn(
                "mt-8 relative h-48 w-full rounded-2xl border flex items-center justify-center p-8 overflow-hidden transition-colors",
                isDark ? "bg-black/20 border-white/5" : "bg-zinc-50 border-zinc-100"
              )}>
                <div className="flex items-center gap-12 relative z-10">
                  <div className={cn(
                    "h-16 w-16 border rounded-2xl flex items-center justify-center shadow-lg transition-all",
                    isDark ? "bg-[#FF6C37]/10 border-[#FF6C37]/20 text-[#FF6C37] shadow-[#FF6C37]/10" : "bg-white border-zinc-200 text-[#E85D2A] shadow-sm"
                  )}>
                    <span className="font-bold">n8n</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#FF6C37] via-primary to-[#0088CC] relative">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 h-2 w-2 rounded-full bg-[#FF6C37] blur-sm animate-ping" />
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 h-2 w-2 rounded-full bg-[#0088CC] blur-sm animate-ping" />
                  </div>
                  <div className={cn(
                    "h-16 w-16 border rounded-2xl flex items-center justify-center shadow-lg transition-all",
                    isDark ? "bg-primary/10 border-primary/20 text-primary shadow-primary/10" : "bg-white border-zinc-200 text-[#006699] shadow-sm"
                  )}>
                    <Send className="h-8 w-8" />
                  </div>
                </div>
                {/* Background Grid */}
                <div className={cn(
                    "absolute inset-0 pointer-events-none opacity-[0.05]",
                    isDark ? "text-white" : "text-[#1E293B]"
                  )} 
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} 
                />
              </div>
            </div>

            <div className="md:col-span-4 bento-card space-y-6">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50/50 border-amber-200 text-amber-600")}>
                <BellOff className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-[#1E293B]")}>Cancel Anytime</h3>
                <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-[#64748B]")}>Mistake in your schedule? Manually override and delete pending reminders before they leave the server.</p>
              </div>
              <div className="pt-4">
                <div className={cn(
                  "border rounded-xl p-4 flex items-center gap-3",
                  isDark ? "bg-amber-500/5 border-amber-500/10" : "bg-amber-50/10 border-amber-100"
                )}>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium uppercase tracking-widest leading-none",
                    isDark ? "text-amber-500/80" : "text-amber-600"
                  )}>Safe Disposal</span>
                </div>
              </div>
            </div>

            <div className={cn(
              "md:col-span-12 bento-card flex items-center justify-between border-none transition-all duration-500",
              isDark ? "bg-gradient-to-br from-[#161617] to-[#1E1E20] dark:border dark:border-[#262626]" : "bg-white shadow-2xl shadow-zinc-200/50 border-zinc-100"
            )}>
              <div className="space-y-4 max-w-sm">
                <h3 className={cn("text-2xl font-bold italic tracking-tighter", isDark ? "text-white" : "text-[#1E293B]")}>Ready to take control?</h3>
                <p className={isDark ? "text-zinc-400" : "text-[#64748B]"}>Join automation experts who manage thousands of alerts daily with PredaY.</p>
                <Button variant="link" className="p-0 text-primary h-auto group font-bold" onClick={onLoginClick}>
                  Explore Enterprise version <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="hidden lg:block relative w-48 h-48 opacity-10 dark:opacity-20 pointer-events-none">
                <Zap className="w-full h-full text-primary blur-xl" />
                <Zap className="absolute inset-0 w-full h-full text-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How it Works */}
        <section className={cn(
          "py-24 border-y transition-colors duration-500",
          isDark ? "bg-[#161617] border-white/5" : "bg-zinc-50 border-zinc-200"
        )}>
          <div className="max-w-7xl mx-auto px-8 space-y-16">
            <div className="text-center space-y-4">
              <h2 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-[#1E293B]")}>Three Steps to Freedom</h2>
              <p className={isDark ? "text-zinc-400" : "text-[#64748B]"}>Automation management shouldn&apos;t be complicated.</p>
            </div>

            <div className="relative">
              {/* Timeline Connector */}
              <div className={cn(
                "absolute top-1/2 left-0 w-full h-px hidden md:block",
                isDark ? "bg-gradient-to-r from-transparent via-white/10 to-transparent" : "bg-gradient-to-r from-transparent via-zinc-200 to-transparent"
              )} />
              
              <div className="grid md:grid-cols-3 gap-12 relative z-10">
                {[
                  { step: '01', title: 'Connect', desc: 'Plug in your n8n webhook URL in under 30 seconds.' },
                  { step: '02', title: 'Schedule', desc: 'Set reminders via professional Dashboard or Bot commands.' },
                  { step: '03', title: 'Relax', desc: 'Precise notifications arrive exactly when they should.' },
                ].map((item, idx) => (
                  <div key={idx} className={cn(
                    "p-8 rounded-3xl border text-center space-y-4 group transition-all duration-300",
                    isDark 
                      ? "bg-[#0B0B0C]/50 border-white/5 hover:border-primary/30" 
                      : "bg-white border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  )}>
                    <div className={cn(
                      "mx-auto h-12 w-12 rounded-2xl border flex items-center justify-center font-bold group-hover:scale-110 transition-transform",
                      isDark 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]"
                    )}>
                      {item.step}
                    </div>
                    <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-[#1E293B]")}>{item.title}</h3>
                    <p className={cn("text-sm leading-relaxed", isDark ? "text-zinc-400" : "text-[#64748B]")}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Interactive Preview */}
        <section className="max-w-7xl mx-auto px-8 py-32 space-y-16 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-[#1E293B]")}>The Dashboard <br />of Your Dreams.</h2>
              <p className={cn("leading-relaxed", isDark ? "text-zinc-400" : "text-[#64748B]")}>
                Clean, dark, and blazingly fast. No empty states, no clutter. Just your data, beautifully organized and ready for action.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  'Real-time status tracking',
                  'Category-based filtering',
                  'One-click rescheduling (Expired items)',
                  'Direct Telegram connection status'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-[#1E293B]")}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 relative group">
              <div className="absolute -inset-4 bg-primary/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Dynamic Theme Dashboard Preview */}
              <Card className={cn(
                "relative border shadow-2xl rounded-3xl overflow-hidden scale-100 group-hover:scale-[1.02] transition-all duration-500",
                isDark ? "border-white/10 bg-[#161617]" : "border-zinc-200 bg-white"
              )}>
                <CardContent className="p-0">
                  <div className={cn(
                    "h-10 border-b flex items-center px-4 gap-2",
                    isDark ? "border-white/5 bg-white/5" : "border-zinc-100 bg-zinc-50"
                  )}>
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                    <div className={cn("flex-1 text-center font-mono text-[10px] opacity-50", isDark ? "text-zinc-500" : "text-zinc-400")}>app.preday.pro / dashboard</div>
                  </div>
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow className={cn("border-b hover:bg-transparent", isDark ? "border-white/5" : "border-zinc-100")}>
                          <TableHead className={cn("text-[10px] uppercase tracking-widest font-bold", isDark ? "text-zinc-400" : "text-zinc-500")}>Event</TableHead>
                          <TableHead className={cn("text-[10px] uppercase tracking-widest font-bold", isDark ? "text-zinc-400" : "text-zinc-500")}>Schedule</TableHead>
                          <TableHead className={cn("text-[10px] uppercase tracking-widest font-bold text-right", isDark ? "text-zinc-400" : "text-zinc-500")}>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: 'Server Maintenance', date: 'Tomorrow, 9:00 AM', status: 'Pending', statusColor: 'bg-primary' },
                          { name: 'Weekly Team Sync', date: 'In 2 days, 10:00 AM', status: 'Pending', statusColor: 'bg-primary' },
                          { name: 'Product Launch Alert', date: 'Mar 15, 8:00 AM', status: 'Pending', statusColor: 'bg-primary' },
                        ].map((row, i) => (
                          <TableRow key={i} className={cn("border-b last:border-0 transition-colors", isDark ? "border-white/5 hover:bg-white/5" : "border-zinc-100 hover:bg-zinc-50")}>
                            <TableCell className={cn("font-medium text-sm py-4", isDark ? "text-white" : "text-[#1E293B]")}>{row.name}</TableCell>
                            <TableCell className={cn("text-[12px]", isDark ? "text-zinc-400" : "text-[#64748B]")}>{row.date}</TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", row.statusColor)} />
                                <span className="text-[10px] font-bold text-primary uppercase">{row.status}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Bubble Mockup */}
              <div className={cn(
                "absolute -bottom-12 -right-12 w-64 border rounded-2xl p-4 shadow-3xl backdrop-blur-xl animate-float hidden md:block transition-all duration-500",
                isDark ? "bg-[#161617] border-white/10 shadow-black/50" : "bg-white border-zinc-200 shadow-zinc-200/50"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <Send className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-xs font-bold block leading-none", isDark ? "text-white" : "text-[#1E293B]")}>PredaY Bot</span>
                    <span className={cn("text-[10px]", isDark ? "text-zinc-500" : "text-zinc-400")}>Just now</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={cn(
                    "rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed",
                    isDark ? "bg-white/5 text-zinc-300" : "bg-zinc-100 text-[#1E293B]"
                  )}>
                    🔔 Reminder: **Server Maintenance** starting in 1 hour.
                  </div>
                  <div className="flex justify-end">
                    <MousePointer2 className="h-5 w-5 text-primary rotate-[15deg] absolute -bottom-4 -right-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={cn(
        "max-w-7xl mx-auto px-8 py-16 border-t relative z-10 transition-colors duration-500",
        isDark ? "border-white/5" : "border-zinc-200"
      )}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-bold text-lg tracking-tighter flex items-center gap-2">
            <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
              <Send className="h-4 w-4 text-white" />
            </div>
            <span className={isDark ? "text-white" : "text-[#1E293B]"}>PredaY</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            {[ 'Privacy', 'Terms', 'Contact' ].map((link) => (
              <a key={link} href="#" className={cn(
                "transition-colors",
                isDark ? "text-zinc-400 hover:text-white" : "text-[#64748B] hover:text-[#1E293B]"
              )}>{link}</a>
            ))}
          </div>
          <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-[#64748B]")}>&copy; {new Date().getFullYear()} PredaY. For automation experts.</p>
        </div>
      </footer>
    </div>
  );
}
