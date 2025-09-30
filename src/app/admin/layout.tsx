
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons/logo';

const ADMIN_EMAIL = 'georgedianoh@gmail.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login?type=admin');
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user, loading, router, toast]);

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                    <AdminSidebar isMobile />
                </SheetContent>
            </Sheet>
             <div className="flex items-center gap-2">
                <Logo className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
             </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
