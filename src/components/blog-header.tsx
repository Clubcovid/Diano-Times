"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Rss } from 'lucide-react';

export function BlogHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold font-headline text-primary">
          Diano Times
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
          <Link href="/fashion" className="text-muted-foreground hover:text-primary transition-colors">Fashion</Link>
          <Link href="/gadgets" className="text-muted-foreground hover:text-primary transition-colors">Gadgets</Link>
          <Link href="/lifestyle" className="text-muted-foreground hover:text-primary transition-colors">Lifestyle</Link>
          <Link href="/video" className="text-muted-foreground hover:text-primary transition-colors">Video</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
           <Button variant="outline">
            <Rss className="mr-2" />
            Subscribe
          </Button>
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-md" />
          ) : user ? (
            <Button asChild>
              <Link href="/admin">Dashboard</Link>
            </Button>
          ) : null}
         </div>
      </div>
    </header>
  );
}
