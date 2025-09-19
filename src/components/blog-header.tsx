"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from './ui/skeleton';
import { LogIn, UserPlus, LayoutDashboard, UserCircle, LogOut, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { ThemeToggle } from './theme-toggle';

export function BlogHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  const navLinks = (
    <>
      <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
      <Link href="/fashion" className="text-muted-foreground hover:text-primary transition-colors">Fashion</Link>
      <Link href="/gadgets" className="text-muted-foreground hover:text-primary transition-colors">Gadgets</Link>
      <Link href="/lifestyle" className="text-muted-foreground hover:text-primary transition-colors">Lifestyle</Link>
      <Link href="/video" className="text-muted-foreground hover:text-primary transition-colors">Video</Link>
      <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold font-headline text-primary">
          Diano Times
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks}
        </nav>
        <div className="flex items-center gap-2">
           <ThemeToggle />
           {loading ? (
            <Skeleton className="h-10 w-24 rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.displayName || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile"><UserCircle className="mr-2"/>Profile</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/admin"><LayoutDashboard className="mr-2"/>Admin</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2"/>
                      Logout
                    </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <>
                <div className="hidden sm:flex">
                  <Button variant="ghost" asChild>
                      <Link href="/login">
                          <LogIn className="mr-2"/>
                          Login
                      </Link>
                  </Button>
                  <Button asChild>
                      <Link href="/register">
                          <UserPlus className="mr-2"/>
                          Register
                      </Link>
                  </Button>
                </div>
             </>
          )}
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="p-4">
                  <Link href="/" className="text-2xl font-bold font-headline text-primary mb-8 block">
                    Diano Times
                  </Link>
                  <nav className="grid gap-4 text-lg">
                    {navLinks}
                  </nav>
                   {!user && !loading && (
                    <div className="mt-8 grid gap-4">
                      <SheetClose asChild>
                         <Button asChild>
                           <Link href="/login">
                              <LogIn className="mr-2"/>
                              Login
                           </Link>
                         </Button>
                      </SheetClose>
                       <SheetClose asChild>
                          <Button variant="outline" asChild>
                            <Link href="/register">
                              <UserPlus className="mr-2"/>
                              Register
                            </Link>
                          </Button>
                       </SheetClose>
                    </div>
                  )}
                </div>
            </SheetContent>
          </Sheet>
         </div>
      </div>
    </header>
  );
}
