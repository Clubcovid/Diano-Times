'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

const ADMIN_EMAIL = 'georgedianoh@gmail.com';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold font-headline text-primary">
                Diano Times
            </Link>
             <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                <Link href="/fashion" className="text-muted-foreground hover:text-primary transition-colors">Fashion</Link>
                <Link href="/gadgets" className="text-muted-foreground hover:text-primary transition-colors">Gadgets</Link>
                <Link href="/lifestyle" className="text-muted-foreground hover:text-primary transition-colors">Lifestyle</Link>
                <Link href="/video" className="text-muted-foreground hover:text-primary transition-colors">Video</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
             </nav>
            <div className="flex items-center gap-4">
                {isAdmin && (
                    <Button asChild variant="secondary">
                        <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                )}
                <Button onClick={handleSignOut} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
            </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-headline">{user.displayName || 'Welcome'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
                This is your profile page. More features coming soon!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
