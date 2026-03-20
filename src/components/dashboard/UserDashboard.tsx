'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BellPlus, Trash2, Edit2, AlertTriangle, Pause, Bell, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import TelegramLinkPrompt from './TelegramLinkPrompt';
import { EditReminderDialog } from './EditReminderDialog';
import { CreateReminderDialog } from './CreateReminderDialog';

interface Reminder {
  id: string;
  message: string;
  category?: 'Personal' | 'Bill' | 'Work' | 'Urgent';
  scheduled_time: Timestamp | Date | string | null;
  event_date?: Timestamp | Date | string | null;
  original_event_date?: Timestamp | Date | string | null;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_sent: boolean;
  is_active: boolean;
  created_at?: Timestamp | Date | string;
}

interface UserDashboardProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function UserDashboard({ initialTab = 'upcoming', onTabChange }: UserDashboardProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!user?.chat_id) {
      setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 0);
      return;
    }

    const q = query(
      collection(db, 'reminders'),
      where('chat_id', '==', user.chat_id),
      orderBy('scheduled_time', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reminders:", error);
      toast.error("Failed to load reminders.");
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const cleanMessage = (msg: string) => {
    return msg
      .replace(/✅? ?Reminder set for \*\*/g, '')
      .replace(/✅? ?Reminder: \*\*/g, '')
      .replace(/\*\*$/g, '')
      .replace(/\*\*/g, '')
      .split(/\. I will notify you on/i)[0]
      .split(/\. Next alert:/i)[0]
      .trim();
  };

  const getReminderStatus = (reminder: Reminder) => {
    if (reminder.is_sent) return 'Sent';
    if (reminder.is_active === false) return 'Paused';
    
    let scheduledDate: Date;
    if (reminder.scheduled_time instanceof Timestamp) {
      scheduledDate = reminder.scheduled_time.toDate();
    } else if (reminder.scheduled_time instanceof Date) {
      scheduledDate = reminder.scheduled_time;
    } else {
      scheduledDate = new Date(reminder.scheduled_time as string);
    }

    return scheduledDate < new Date() ? 'Expired' : 'Active';
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, 'reminders', id), {
        is_active: !currentState
      });
      toast.success(!currentState ? 'Reminder activated' : 'Reminder paused');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getEventAndAlertDates = (reminder: Reminder) => {
    const { scheduled_time, event_date } = reminder;
    if (!scheduled_time) return { eventDate: 'N/A', relativeDate: 'N/A', alertDate: 'N/A' };
    
    let alertDateObj: Date;
    if (scheduled_time instanceof Timestamp) {
      alertDateObj = scheduled_time.toDate();
    } else if (scheduled_time instanceof Date) {
      alertDateObj = scheduled_time;
    } else {
      alertDateObj = new Date(scheduled_time);
    }
    
    if (isNaN(alertDateObj.getTime())) return { eventDate: 'Invalid', relativeDate: 'Invalid', alertDate: 'Invalid' };
    
    let eventDateObj: Date;
    if (event_date) {
      if (event_date instanceof Timestamp) {
        eventDateObj = event_date.toDate();
      } else if (event_date instanceof Date) {
        eventDateObj = event_date;
      } else {
        eventDateObj = new Date(event_date);
      }
    } else {
      // Fallback for legacy data: reverse calculation based on category
      const leadDays = reminder.category === 'Bill' ? 3 : 1;
      eventDateObj = new Date(alertDateObj);
      eventDateObj.setDate(alertDateObj.getDate() + leadDays);
    }

    return {
      eventDate: format(eventDateObj, 'MMM dd, yyyy'),
      relativeDate: formatDistanceToNow(eventDateObj, { addSuffix: true }),
      alertDate: format(alertDateObj, 'MMM dd, yyyy, hh:mm a'),
    };
  };

  const getCategoryBadge = (category?: string) => {
    const styles: Record<string, string> = {
      Personal: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      Bill:     'bg-amber-500/10  text-amber-500  border-amber-500/20',
      Work:     'bg-purple-500/10 text-purple-500 border-purple-500/20',
      Urgent:   'bg-rose-500/10   text-rose-500   border-rose-500/20',
    };
    const label = category || 'Personal';
    return (
      <Badge 
        variant="outline" 
        className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", styles[label] ?? styles.Personal)}
      >
        {label}
      </Badge>
    );
  };

  const { pendingReminders, historyReminders } = useMemo(() => {
    const now = new Date();
    const ongoing: Reminder[] = [];
    const history: Reminder[] = [];

    reminders.forEach(r => {
      let scheduledDate: Date;
      if (r.scheduled_time instanceof Timestamp) {
        scheduledDate = r.scheduled_time.toDate();
      } else if (r.scheduled_time instanceof Date) {
        scheduledDate = r.scheduled_time;
      } else {
        scheduledDate = new Date(r.scheduled_time as string);
      }

      const isUpcoming = !r.is_sent && r.is_active !== false && scheduledDate > now;

      if (isUpcoming) {
        ongoing.push(r);
      } else {
        history.push(r);
      }
    });

    return {
      pendingReminders: ongoing.sort((a, b) => {
        const dateA = a.scheduled_time instanceof Timestamp ? a.scheduled_time.toMillis() : new Date(a.scheduled_time as string).getTime();
        const dateB = b.scheduled_time instanceof Timestamp ? b.scheduled_time.toMillis() : new Date(b.scheduled_time as string).getTime();
        return dateA - dateB;
      }),
      historyReminders: history.sort((a, b) => {
        const dateA = a.scheduled_time instanceof Timestamp ? a.scheduled_time.toMillis() : new Date(a.scheduled_time as string).getTime();
        const dateB = b.scheduled_time instanceof Timestamp ? b.scheduled_time.toMillis() : new Date(b.scheduled_time as string).getTime();
        return dateB - dateA;
      })
    };
  }, [reminders]);

  const getStatusBadge = (reminder: Reminder) => {
    const status = getReminderStatus(reminder);
    if (status === 'Sent') {
      return (
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 glow-sent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Sent</span>
        </div>
      );
    }
    if (status === 'Active') {
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 glow-indigo" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Active</span>
        </div>
      );
    }
    if (status === 'Expired') {
      return (
        <div className="flex items-center gap-3 text-amber-500">
          <span className="flex h-2 w-2 rounded-full bg-amber-500" />
          <div className="flex items-center gap-1.5 ">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Expired</span>
          </div>
        </div>
      );
    }
    if (status === 'Paused') {
      return (
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-zinc-400" />
          <div className="flex items-center gap-1.5">
            <Pause className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Paused</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-8">Loading reminders...</div>;
  if (!user?.chat_id) return <TelegramLinkPrompt />;

  return (
    <div className="space-y-8">
      <Tabs 
        value={initialTab} 
        onValueChange={onTabChange}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-8">
          <TabsList className="bg-muted border border-border p-1 h-12 rounded-xl">
            <TabsTrigger 
              value="upcoming" 
              className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-muted-foreground"
            >
              Upcoming Alerts <span className="ml-2 opacity-50 font-mono text-xs">{pendingReminders.length}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="px-6 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-muted-foreground"
            >
              History <span className="ml-2 opacity-50 font-mono text-xs">{historyReminders.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="mt-0 outline-none">
          <Card className="border border-border shadow-2xl bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {pendingReminders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
                  <div className="p-6 rounded-2xl bg-muted border border-border">
                    <BellPlus className="h-10 w-10 opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Yo! No pending reminders</p>
                    <p className="text-sm text-muted-foreground">Tap + to get your first alert ready.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Table - Hidden on mobile */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border h-14">
                          <TableHead className="px-8 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Event Name</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Category</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Schedule</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground w-[120px]">Active</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Status</TableHead>
                          <TableHead className="text-right px-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReminders.map((reminder) => {
                          const { eventDate, relativeDate, alertDate } = getEventAndAlertDates(reminder);
                          const isFuture = reminder.scheduled_time ? (reminder.scheduled_time instanceof Timestamp ? reminder.scheduled_time.toDate() : new Date(reminder.scheduled_time.toString())) > new Date() : false;
                          
                          return (
                            <TableRow key={reminder.id} className="group border-b border-border/40 last:border-0 hover:bg-accent/5 dark:bg-[#1E1E1E]/50 dark:hover:bg-[#222223] transition-all h-24">
                              <TableCell className="px-8">
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="font-bold text-[15px] text-foreground dark:text-white block truncate max-w-[180px]" 
                                    title={cleanMessage(reminder.message)}
                                  >
                                    {cleanMessage(reminder.message)}
                                  </span>
                                  {reminder.repeat_type && reminder.repeat_type !== 'none' && (
                                    <RefreshCw className="h-3.5 w-3.5 text-[#0088CC] animate-spin-slow" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {getCategoryBadge(reminder.category)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1.5 py-1">
                                  <div className="flex items-center gap-2 group/time">
                                    <div className="p-1.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20">
                                      <Bell className="h-3.5 w-3.5 text-indigo-500" />
                                    </div>
                                    <span className="text-[13px] font-bold tracking-tight text-foreground dark:text-white leading-none">
                                      {alertDate}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 ml-1">
                                    <span className="text-[11px] font-medium text-muted-foreground/80">
                                      Due: {eventDate}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <span className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.05em]",
                                      isFuture 
                                        ? "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400" 
                                        : "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400"
                                    )}>
                                      {relativeDate}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center w-[60px]">
                                  <Switch 
                                    checked={reminder.is_active !== false} 
                                    onCheckedChange={() => handleToggleActive(reminder.id, reminder.is_active !== false)}
                                    className={cn(
                                      "h-5 w-9 transition-all duration-300",
                                      reminder.is_active !== false ? "data-[state=checked]:bg-[#0088CC] glow-switch" : "bg-muted"
                                    )}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(reminder)}</TableCell>
                              <TableCell className="text-right px-8">
                                <div className="flex items-center justify-end gap-1">
                                  <div className="action-hover-circle">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground/60 hover:text-indigo-500 transition-colors z-10"
                                      onClick={() => {
                                        setEditingReminder(reminder);
                                        setShowEditDialog(true);
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="action-hover-circle">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground/60 hover:text-rose-500 transition-colors z-10"
                                      onClick={() => handleDelete(reminder.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards - Shown only on mobile */}
                  <div className="block md:hidden divide-y divide-border/40">
                    {pendingReminders.map((reminder) => {
                      const { eventDate, alertDate, relativeDate } = getEventAndAlertDates(reminder);
                      const isFuture = reminder.scheduled_time ? (reminder.scheduled_time instanceof Timestamp ? reminder.scheduled_time.toDate() : new Date(reminder.scheduled_time.toString())) > new Date() : false;
                      
                      return (
                        <div key={reminder.id} className="p-5 space-y-4 active:bg-accent/5 transition-colors">
                          <div className="flex items-center justify-between">
                            {getCategoryBadge(reminder.category)}
                            <div className="flex items-center gap-3">
                              <Switch 
                                checked={reminder.is_active !== false} 
                                onCheckedChange={() => handleToggleActive(reminder.id, reminder.is_active !== false)}
                                className={cn(
                                  "h-5 w-9",
                                  reminder.is_active !== false ? "data-[state=checked]:bg-[#0088CC]" : "bg-muted"
                                )}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight">
                                {cleanMessage(reminder.message)}
                              </h3>
                              {reminder.repeat_type && reminder.repeat_type !== 'none' && (
                                <RefreshCw className="h-4 w-4 text-[#0088CC]" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(reminder)}
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.05em]",
                                isFuture ? "bg-cyan-500/10 text-cyan-500" : "bg-rose-500/10 text-rose-500"
                              )}>
                                {relativeDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-accent/30 border border-border/50">
                            <div className="flex items-center gap-2">
                              <Bell className="h-3.5 w-3.5 text-primary" />
                              <span className="text-[13px] font-bold text-foreground">
                                {alertDate}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground ml-5">
                              Due: {eventDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button 
                              variant="outline" 
                              className="flex-1 h-11 rounded-xl text-sm font-bold border-border bg-background"
                              onClick={() => {
                                setEditingReminder(reminder);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              className="h-11 w-11 rounded-xl border-border bg-background text-rose-500 hover:text-rose-600"
                              onClick={() => handleDelete(reminder.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-xl">
            <CardContent className="p-0">
              {historyReminders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No history items yet.</div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border h-14">
                          <TableHead className="px-8 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Event Name</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Schedule Date</TableHead>
                          <TableHead className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyReminders.map((reminder) => {
                          const { eventDate, alertDate } = getEventAndAlertDates(reminder);
                          return (
                            <TableRow key={reminder.id} className="group border-b border-border/40 last:border-0 hover:bg-accent/5 dark:bg-[#161617]/50 transition-all h-20">
                              <TableCell className="px-8">
                                <span 
                                  className="font-bold text-sm text-muted-foreground block truncate max-w-[200px]" 
                                  title={cleanMessage(reminder.message)}
                                >
                                  {cleanMessage(reminder.message)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 py-1">
                                  <div className="flex items-center gap-2 group/time opacity-70">
                                    <Bell className="h-3 w-3 text-muted-foreground/50" />
                                    <span className="text-[12px] font-medium text-muted-foreground">
                                      {alertDate}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 ml-1 opacity-50">
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                      Due: {eventDate}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(reminder)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Mobile History Cards */}
                  <div className="block md:hidden divide-y divide-border/40">
                    {historyReminders.map((reminder) => {
                      const { eventDate, alertDate } = getEventAndAlertDates(reminder);
                      const status = getReminderStatus(reminder);
                      return (
                        <div key={reminder.id} className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            {getCategoryBadge(reminder.category)}
                            {getStatusBadge(reminder)}
                          </div>
                          <h3 className="text-md font-bold text-muted-foreground/80 leading-tight">
                            {cleanMessage(reminder.message)}
                          </h3>
                          <div className="flex flex-col gap-1 opacity-70">
                            <div className="flex items-center gap-2">
                              <Bell className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">{alertDate}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-5">Due: {eventDate}</span>
                          </div>
                          {status === 'Expired' && (
                            <Button 
                              variant="outline" 
                              className="w-full h-11 rounded-xl text-sm font-bold border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => {
                                setEditingReminder(reminder);
                                setShowEditDialog(true);
                              }}
                            >
                              Reschedule Alert
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditReminderDialog 
        reminder={editingReminder} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <CreateReminderDialog 
          trigger={
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-2xl bg-[#0088CC] hover:bg-[#0088CC]/90 transition-transform active:scale-90 border-none"
            >
              <Plus className="h-7 w-7 text-white" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
