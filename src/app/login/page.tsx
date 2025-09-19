'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, User } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

export default function LoginPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isAdminLogin = searchParams.get('type') === 'admin';

  useEffect(() => {
    if (!authLoading && user) {
      router.push(isAdminLogin ? '/admin' : '/profile');
    }
  }, [user, authLoading, router, isAdminLogin]);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
          title: 'Login Successful',
          description: `Welcome back!`,
      });
      router.push(isAdminLogin ? '/admin' : '/profile');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: 'Could not log in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setLoadingGoogle(false);
    }
  };
  
  const handleGuestLogin = async () => {
    setLoadingGuest(true);
    try {
      await signInAnonymously(auth);
      toast({
          title: 'Welcome, Guest!',
          description: `You are browsing as a guest.`,
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: 'Could not sign in as a guest. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setLoadingGuest(false);
    }
  };

  if (authLoading || user) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/40">
       <div className="text-center mb-8">
            <Link href="/" className="text-4xl font-bold font-headline text-primary">
                Diano Times
            </Link>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{isAdminLogin ? 'Admin Login': 'Get Started'}</CardTitle>
          <CardDescription>Sign in to access your account or continue as a guest.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Button onClick={handleGoogleLogin} disabled={loadingGoogle || loadingGuest}>
              {loadingGoogle ? 'Signing in...' : <><LogIn className="mr-2 h-4 w-4" /> Sign in with Google</>}
            </Button>
            <Button variant="secondary" onClick={handleGuestLogin} disabled={loadingGoogle || loadingGuest}>
                {loadingGuest ? 'Entering...' : <><User className="mr-2 h-4 w-4" /> Continue as Guest</>}
            </Button>
        </CardContent>
         <CardFooter className="flex-col gap-2">
             <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Homepage</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
