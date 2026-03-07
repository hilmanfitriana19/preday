'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TelegramLinkPrompt from './TelegramLinkPrompt';

interface Reminder {
  id: string;
  message: string;
  scheduled_time: string;
  is_sent: boolean;
  created_at: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

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
      where('chat_id', '==', user.chat_id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      
      // Sort by scheduled time descending, handling both strings and Firestore Timestamps
      data.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (val && typeof val === 'object' && 'toDate' in val) return val.toDate().getTime();
          return new Date(val).getTime();
        };
        return getTime(b.scheduled_time) - getTime(a.scheduled_time);
      });
      
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

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'PPp');
  };

  if (loading) return <div className="p-8">Loading reminders...</div>;
  if (!user?.chat_id) return <TelegramLinkPrompt />;

  const pendingReminders = reminders.filter(r => !r.is_sent);
  const sentReminders = reminders.filter(r => r.is_sent);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">My Reminders</h2>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Alerts ({pendingReminders.length})</TabsTrigger>
          <TabsTrigger value="history">History ({sentReminders.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No upcoming alerts.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">{reminder.message}</TableCell>
                        <TableCell>{formatDate(reminder.scheduled_time)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-blue-500 border-blue-500">Pending</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(reminder.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sent Reminders History</CardTitle>
            </CardHeader>
            <CardContent>
              {sentReminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sent reminders yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentReminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium text-muted-foreground">{reminder.message}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(reminder.scheduled_time)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-green-500 border-green-500">Sent</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
