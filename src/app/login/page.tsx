'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast({
            title: 'Missing fields',
            description: 'Please enter both email and password.',
            variant: 'destructive',
        });
        return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
          title: 'Login Successful',
          description: `Welcome back!`,
      });
      router.push(isAdminLogin ? '/admin' : '/profile');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setLoading(false);
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
          <CardTitle className="text-2xl font-headline">{isAdminLogin ? 'Admin Login': 'Login'}</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Log In</>}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col gap-2">
            <p className="text-xs text-muted-foreground">
                No account? <Link href="/register" className="text-primary hover:underline">Create one</Link>
            </p>
             <Button variant="outline" asChild className="w-full">
                <Link href="/">Continue as Guest</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
