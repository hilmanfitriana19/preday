'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Bell, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface Reminder {
  id: string;
  chat_id: number;
  message: string;
  category?: 'Personal' | 'Bill' | 'Work' | 'Urgent';
  scheduled_time: Timestamp | Date | string;
  event_date?: Timestamp | Date | string | null;
  original_event_date?: Timestamp | Date | string | null;
  repeat_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_sent: boolean;
  is_active: boolean;
  created_at: Timestamp | Date | string;
}

export default function AdminDashboard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reminders'), orderBy('scheduled_time', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching all reminders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;

  const totalAlerts = reminders.length;
  const pendingAlerts = reminders.filter(r => !r.is_sent).length;
  const sentAlerts = reminders.filter(r => r.is_sent).length;
  const uniqueUsers = new Set(reminders.map(r => r.chat_id)).size;

  const formatDateValue = (val: Timestamp | Date | string | null | undefined, includeTime: boolean = true) => {
    if (!val) return 'N/A';
    let date: Date;
    if (val instanceof Timestamp) {
      date = val.toDate();
    } else if (val instanceof Date) {
      date = val;
    } else {
      date = new Date(val);
    }
    return isNaN(date.getTime()) ? 'Invalid' : format(date, includeTime ? 'PPp' : 'PP');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
        <Badge variant="secondary" className="text-sm">Total Alerts: {totalAlerts}</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Having active or past reminders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAlerts}</div>
            <p className="text-xs text-muted-foreground">Waiting to be sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Alerts</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentAlerts}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All System Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID (chat_id)</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell className="font-mono">{reminder.chat_id}</TableCell>
                  <TableCell className="font-medium">{reminder.message}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold">Alert: {formatDateValue(reminder.scheduled_time)}</span>
                      {reminder.event_date && (
                        <span className="text-[10px] text-muted-foreground">Event: {formatDateValue(reminder.event_date, false)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reminder.is_sent ? (
                      <Badge variant="outline" className="text-green-500 border-green-500">Sent</Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-500 border-blue-500">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
