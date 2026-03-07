import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bot, BellOff, Settings2, ShieldCheck, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Telegram Reminder Dashboard
          </div>
          <Button onClick={onLoginClick}>Sign In</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Manage Your Automations <br className="hidden md:block" />
            <span className="text-blue-500">With Confidence.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A centralized dashboard to monitor and control your Telegram alerts sent via n8n and Firebase.
          </p>
          <Button size="lg" className="px-8" onClick={onLoginClick}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-zinc-900 border-y py-16">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300">
                <BellOff className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Cancel Anytime</h3>
              <p className="text-muted-foreground">Easily delete pending reminders before they are dispatched to your Telegram.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-300">
                <Settings2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">n8n Integration</h3>
              <p className="text-muted-foreground">Directly connected to Firestore and your n8n workflows for seamless delivery.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Role-based Access</h3>
              <p className="text-muted-foreground">Dedicated user and admin views to securely manage your scheduled alerts.</p>
            </div>
          </div>
        </section>

        {/* Example Dashboard Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Dashboard Preview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This is an example of what your dashboard looks like when there is no active data to display.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto opacity-75 backdrop-blur-sm pointer-events-none">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle>Upcoming Alerts (Example)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Bot className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                          <p className="text-sm">Your n8n webhook hasn&apos;t scheduled anything yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Telegram Reminder Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}
