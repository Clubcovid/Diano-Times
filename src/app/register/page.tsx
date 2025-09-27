
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { GoogleIcon } from '@/components/icons/google';

export default function RegisterPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleGoogleRegister = async () => {
    setLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Registration Successful',
        description: 'Welcome to Talk of Nations!',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Could not register with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive'});
        return;
    }
    setLoadingEmail(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      toast({
        title: 'Registration Successful',
        description: 'Welcome to Talk of Nations!',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Could not create an account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingEmail(false);
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
          Talk of Nations
        </Link>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join our community to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleEmailRegister} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input id="displayName" type="text" placeholder="John Doe" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loadingEmail || loadingGoogle}>
              {loadingEmail ? 'Creating account...' : <><UserPlus className="mr-2 h-4 w-4" /> Sign Up</>}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleGoogleRegister} disabled={loadingGoogle || loadingEmail}>
            {loadingGoogle ? 'Redirecting...' : <><GoogleIcon className="mr-2 h-4 w-4" /> Google</>}
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4 text-sm">
          <div>
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Sign in
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
