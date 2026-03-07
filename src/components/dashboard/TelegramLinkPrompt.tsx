'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircleWarning, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TelegramLinkPrompt() {
  const { user } = useAuth();
  
  // Encode email for Telegram start parameter (only A-Z, a-z, 0-9, _ and - allowed)
  // We use base64 encoding and make it URL-safe
  const userIdentifier = user?.email 
    ? btoa(user.email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    : 'unknown';

  const telegramAppLink = `tg://resolve?domain=hyhilman_reminder_bot&start=${userIdentifier}`;
  const telegramWebLink = `https://t.me/hyhilman_reminder_bot?start=${userIdentifier}`;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg border-blue-100 dark:border-blue-900">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-blue-100 dark:bg-blue-900 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center">
            <MessageCircleWarning className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-2xl">Connect Telegram</CardTitle>
            <CardDescription className="pt-2">
              Your account is missing a mapped Telegram Chat ID. We need this to send your scheduled reminders.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg text-sm border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4" /> How to connect your account:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                Click the button below to open Telegram (App or Web): <br/>
                <div className="flex flex-col sm:flex-row gap-2 mt-2 mb-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full sm:w-auto bg-[#229ED9] hover:bg-[#1a8cd8] text-white"
                    asChild
                  >
                    <a href={telegramAppLink} target="_blank" rel="noopener noreferrer">
                      Open Telegram App
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <a href={telegramWebLink} target="_blank" rel="noopener noreferrer">
                      Open Telegram Web <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </div>
              </li>
              <li>Press <strong>START</strong> in the Telegram chat to register your account.</li>
              <li>Wait a moment for our backend (n8n) to link your Telegram ID to this account.</li>
              <li>Once you&apos;ve done that, refresh this page to access your dashboard.</li>
            </ol>
          </div>

          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            I&apos;ve Connected My Telegram &rarr; Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
