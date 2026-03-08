'use client';

import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, User, Trash2, Link2Off, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfileView() {
  const { user } = useAuth();
  const [unlinking, setUnlinking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!user) return null;

  const handleUnlinkTelegram = async () => {
    setUnlinking(true);
    try {
      const userRef = doc(db, 'users', user.email || user.uid);
      await updateDoc(userRef, {
        chat_id: null
      });
      toast.success('Telegram account unlinked successfully');
      setShowUnlinkDialog(false);
      // Wait for AuthContext to update (it listens to Firestore changes potentially, 
      // but current AuthContext.tsx only fetches on auth state change.
      // Actually, AuthContext.tsx uses onAuthStateChanged which doesn't listen to Firestore doc updates.
      // I should probably manually reload or update the context if I want immediate UI changes.
      // But the implementation plan said Dashboard should hide reminders table.
      // So I might need to refresh the page or improve AuthContext.
      window.location.reload(); 
    } catch (error) {
      console.error('Error unlinking Telegram:', error);
      toast.error('Failed to unlink Telegram account');
    } finally {
      setUnlinking(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      const batch = writeBatch(db);

      // 1. Delete reminders
      if (user.chat_id) {
        const remindersRef = collection(db, 'reminders');
        const q = query(remindersRef, where('chat_id', '==', user.chat_id));
        const snapshots = await getDocs(q);
        snapshots.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // 2. Delete user doc
      const userRef = doc(db, 'users', user.email || user.uid);
      batch.delete(userRef);

      // Commit Firestore changes
      await batch.commit();

      // 3. Delete from Firebase Auth
      await deleteUser(currentUser);

      toast.success('Account deleted successfully. We\'re sorry to see you go.');
      // Redirect or reload is handled by auth state change
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
        toast.error('Please logout and login again to delete your account for security reasons.');
      } else {
        toast.error('Failed to delete account. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Account Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>Your registered account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email || ''} readOnly className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Telegram Chat ID</span>
                {user.chat_id ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Not Linked
                  </Badge>
                )}
              </Label>
              <div className="flex gap-2">
                <Input 
                  value={user.chat_id || 'Not linked'} 
                  readOnly 
                  className={cn("bg-muted/50", !user.chat_id && "italic text-muted-foreground")} 
                />
                {user.chat_id && (
                  <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5">
                        <Link2Off className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Unlink Telegram Account?</DialogTitle>
                        <DialogDescription>
                          This will stop you from receiving reminders on Telegram. You can re-link your account anytime by visiting the bot.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowUnlinkDialog(false)} disabled={unlinking}>Cancel</Button>
                        <Button variant="destructive" onClick={handleUnlinkTelegram} disabled={unlinking}>
                          {unlinking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Unlink Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {!user.chat_id && (
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-3 w-3 mr-2" /> Relink
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Active - {user.role === 'admin' ? 'Administrator' : 'Standard User'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/70">Actions that cannot be undone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Deleting your account will remove all your reminders and data from our systems (GDPR compliant).
            </p>
          </CardContent>
          <CardFooter>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="border-destructive">
                <DialogHeader>
                  <DialogTitle className="text-destructive">Delete Your Account?</DialogTitle>
                  <DialogDescription>
                    This is a permanent action. All your reminders and profile data will be erased forever. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} disabled={deleting} className="sm:flex-1">Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="sm:flex-2">
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete Everything
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Shorthand for cn
function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ');
}
