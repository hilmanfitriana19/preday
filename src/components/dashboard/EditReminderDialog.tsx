import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addDays, startOfToday } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Calendar as CalendarIcon, MessageSquare, Tag, Sparkles, Info, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Constrain to H+2 (2 days from today)
const getMinDate = () => addDays(startOfToday(), 2);

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  category: z.enum(['Personal', 'Bill', 'Work', 'Urgent']),
  repeat_type: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
  event_date: z.date({
    message: 'Target date is required',
  }).refine((date) => {
    return date >= getMinDate();
  }, {
    message: 'Event date must be at least 2 days in the future',
  }),
});

interface Reminder {
  id: string;
  message: string;
  category?: 'Personal' | 'Bill' | 'Work' | 'Urgent';
  scheduled_time: Timestamp | Date | string | null;
  event_date?: Timestamp | Date | string | null;
  original_event_date?: Timestamp | Date | string | null;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_sent: boolean;
}

interface EditReminderDialogProps {
  reminder: Reminder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReminderDialog({ reminder, open, onOpenChange }: EditReminderDialogProps) {
  const [loading, setLoading] = useState(false);
  const minDate = getMinDate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      category: 'Personal',
      event_date: minDate,
    },
  });

  useEffect(() => {
    if (reminder) {
      let eventDate: Date;
      if (reminder.event_date) {
        if (reminder.event_date instanceof Timestamp) {
          eventDate = reminder.event_date.toDate();
        } else if (reminder.event_date instanceof Date) {
          eventDate = reminder.event_date;
        } else {
          eventDate = new Date(reminder.event_date as string);
        }
      } else {
        // Fallback for legacy items: calculate event date from alert time
        let alertTime: Date;
        if (reminder.scheduled_time instanceof Timestamp) {
          alertTime = reminder.scheduled_time.toDate();
        } else if (reminder.scheduled_time instanceof Date) {
          alertTime = reminder.scheduled_time;
        } else {
          alertTime = new Date(reminder.scheduled_time as string);
        }

        const leadDays = reminder.category === 'Bill' ? 3 : 1;
        eventDate = new Date(alertTime);
        eventDate.setDate(alertTime.getDate() + leadDays);
      }
      
      form.reset({
        message: reminder.message
          .replace(/✅ Reminder set for \*\*/g, '')
          .replace(/\*\*$/g, '')
          .replace(/\*\*/g, '')
          .trim(),
        category: reminder.category || 'Personal',
        repeat_type: reminder.repeat_type || 'none',
        event_date: eventDate,
      });
    }
  }, [reminder, form]);

  const selectedCategory = form.watch('category');
  const selectedDate = form.watch('event_date');

  const getScheduledDate = () => {
    if (!selectedDate) return null;
    const leadDays = selectedCategory === 'Bill' ? 3 : 1;
    try {
      const scheduledDateResource = new Date(selectedDate);
      scheduledDateResource.setHours(9, 0, 0, 0);
      const scheduledDate = new Date(scheduledDateResource);
      scheduledDate.setDate(scheduledDateResource.getDate() - leadDays);
      return scheduledDate;
    } catch {
      return null;
    }
  };

  const scheduledDate = getScheduledDate();

  const categoryIcons: Record<string, React.ReactNode> = {
    Personal: <Sparkles className="h-4 w-4 text-primary" />,
    Bill:     <Tag className="h-4 w-4 text-amber-500" />,
    Work:     <Sparkles className="h-4 w-4 text-primary" />,
    Urgent:   <Sparkles className="h-4 w-4 text-rose-500" />,
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!reminder) return;

    setLoading(true);
    try {
      const leadDays = values.category === 'Bill' ? 3 : 1;
      const eventDate = new Date(values.event_date);
      eventDate.setHours(9, 0, 0, 0);
      const scheduledDateTime = new Date(eventDate);
      scheduledDateTime.setDate(eventDate.getDate() - leadDays);

      if (scheduledDateTime < new Date()) {
        toast.error(`Alert for this event would be in the past. Try a later date.`);
        setLoading(false);
        return;
      }
      
      await updateDoc(doc(db, 'reminders', reminder.id), {
        message: values.message,
        category: values.category,
        repeat_type: values.repeat_type,
        scheduled_time: Timestamp.fromDate(scheduledDateTime),
        event_date: Timestamp.fromDate(eventDate),
        is_sent: false, // Revert to pending
        is_active: true, // Reset to active
      });

      toast.success('Reminder updated/rescheduled!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-border shadow-2xl bg-card/95 backdrop-blur-2xl p-0 overflow-hidden rounded-2xl">
        <div className="bg-primary/5 px-8 pt-8 pb-6 border-b border-border">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">Edit Reminder</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              Yo! PredaY will nudge you 1 day before to keep you on track.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> Event Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Renew STNK, Pay Rent..." 
                        className="bg-background border-border h-12 focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground/50"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        <Tag className="h-3 w-3" /> Category
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select 
                            {...field}
                            className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm appearance-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
                          >
                            <option value="Personal">Personal</option>
                            <option value="Bill">Bill</option>
                            <option value="Work">Work</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-foreground">
                            {categoryIcons[selectedCategory]}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground pb-1.5">
                        <CalendarIcon className="h-3 w-3" /> Event Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-12 rounded-xl border-border bg-background text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-foreground" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < minDate
                            }
                            initialFocus
                            className="rounded-xl border-none p-3"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="repeat_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      <RefreshCw className="h-3 w-3" /> Recurrence
                    </FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm appearance-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
                      >
                        <option value="none">None (One-time)</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className={cn(
                  "p-4 rounded-xl border border-dashed transition-colors text-foreground bg-accent/50 border-border"
                )}>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className={cn("h-4 w-4", selectedCategory === 'Bill' ? "text-amber-500" : "text-primary")} />
                    {selectedCategory === 'Bill' 
                      ? "Bills get a 3-day head start." 
                      : "Reminders are sent 1 day before."}
                  </p>
                  {scheduledDate && (
                    <p className="text-[11px] mt-2 text-muted-foreground font-mono flex items-center gap-1.5 opacity-80">
                      <CalendarIcon className="h-3 w-3" />
                      New alert on: {format(scheduledDate, 'MMM dd, yyyy')} at 09:00 AM
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-accent/30 p-3 rounded-lg border border-border/50">
                  <Info className="h-3.5 w-3.5 mt-0.5 text-primary" />
                  <p>
                    <span className="font-bold text-foreground">Earliest selectable date:</span><br />
                    {format(minDate, 'EEEE, MMM dd')} (H+2 requirement).
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 flex flex-col gap-3 sm:flex-col">
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-md font-bold bg-primary hover:opacity-90 transition-all border-none text-primary-foreground">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Reminder"}
              </Button>
              {reminder?.repeat_type && reminder.repeat_type !== 'none' && (
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={loading}
                  onClick={async () => {
                    if (!reminder) return;
                    setLoading(true);
                    try {
                      await updateDoc(doc(db, 'reminders', reminder.id), {
                        repeat_type: 'none'
                      });
                      toast.success('Series stopped. This alert will not repeat.');
                      onOpenChange(false);
                    } catch {
                      toast.error('Failed to stop series');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full h-12 rounded-xl text-md font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-all"
                >
                  Stop Series
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
