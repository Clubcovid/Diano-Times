
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { GoogleIcon } from '@/components/icons/google';
import { Logo } from '@/components/icons/logo';

function LoginForm() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isAdminLogin = searchParams.get('type') === 'admin';

  useEffect(() => {
    if (!authLoading && user) {
      router.push(isAdminLogin ? '/admin' : '/');
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
      router.push(isAdminLogin ? '/admin' : '/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Could not log in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setLoadingGoogle(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: 'Login Successful',
            description: `Welcome back!`,
        });
        router.push(isAdminLogin ? '/admin' : '/');
    } catch (error: any) {
        toast({
            title: 'Login Failed',
            description: error.message || 'Incorrect email or password.',
            variant: 'destructive',
        });
    } finally {
        setLoadingEmail(false);
    }
  }

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
            <Link href="/" className="flex items-center justify-center gap-2">
                <Logo className="h-10 w-10 text-primary" />
                <span className="text-3xl font-extrabold tracking-tight text-foreground">Talk of Nations</span>
            </Link>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">{isAdminLogin ? 'Admin Login': 'Welcome Back'}</CardTitle>
          <CardDescription>Sign in to your account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loadingEmail || loadingGoogle}>
                    {loadingEmail ? 'Signing in...' : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
                </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <Button variant="outline" onClick={handleGoogleLogin} disabled={loadingGoogle || loadingEmail}>
              {loadingGoogle ? 'Redirecting...' : <><GoogleIcon className="mr-2 h-4 w-4" /> Google</>}
            </Button>
        </CardContent>
         <CardFooter className="flex-col gap-4 text-sm">
             <div>
                Don't have an account?{' '}
                <Link href="/register" className="underline hover:text-primary">
                    Sign up
                </Link>
            </div>
            <Button variant="link" asChild className="w-full">
                <Link href="/">Back to Homepage</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
