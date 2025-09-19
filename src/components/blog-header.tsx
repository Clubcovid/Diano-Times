"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

export function BlogHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-2xl font-bold font-headline text-primary transition-colors hover:text-primary/80">
          Diano Blog
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="h-10 w-28 rounded-md" />
          ) : user ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/admin">Dashboard</Link>
              </Button>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">Admin Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
