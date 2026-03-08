import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FirebaseError } from 'firebase/app';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Google login successful!');
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        toast.error(error.message || 'Failed to login with Google');
      } else {
        toast.error('Failed to login with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0B0C] relative overflow-hidden transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      
      <Card className="w-[400px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] dark:shadow-none border-none dark:border dark:border-[#262626] bg-white dark:bg-[#161617] backdrop-blur-xl relative z-10 transition-all">
        <CardHeader className="space-y-4 text-center pb-8 pt-10">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">PredaY</CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Your H-1 Buffer. Yo! Don&apos;t let your day slip away.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-12 px-8">
          <Button 
            type="button" 
            variant="default" 
            className="w-full h-12 text-md font-semibold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-3" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
            </svg>
            Continue with Google
          </Button>
          <p className="mt-8 text-center text-xs text-muted-foreground px-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
