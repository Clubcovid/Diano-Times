'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Megaphone,
  LogOut,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { useAuth } from '../auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/advertisements', label: 'Advertisements', icon: Megaphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const content = (
    <>
      <div className="flex items-center gap-2 p-4 border-b">
        <Link href="/admin" className="text-2xl font-bold font-headline text-primary">
          Diano Times Admin
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                pathname.startsWith(item.href) ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Home className="h-4 w-4" />
            View Site
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || undefined} alt="Admin" />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="truncate">
                <p className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
        </div>
        <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return <div className="flex flex-col h-full">{content}</div>;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background">
      {content}
    </aside>
  );
}
