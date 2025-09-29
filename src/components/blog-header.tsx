
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from './ui/skeleton';
import { LogIn, UserPlus, LayoutDashboard, UserCircle, LogOut, Menu, ChevronDown, Search, Mic } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { ThemeToggle } from './theme-toggle';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import React from 'react';
import { GoogleIcon } from './icons/google';
import { Logo } from './icons/logo';

const categories: { title: string; href: string; description: string }[] = [
  {
    title: 'Fashion',
    href: '/fashion',
    description: 'The latest trends, styles, and fashion news.',
  },
  {
    title: 'Gadgets',
    href: '/gadgets',
    description: 'Reviews and news on the latest tech and electronics.',
  },
  {
    title: 'Lifestyle',
    href: '/lifestyle',
    description: 'Culture, food, travel, and wellness.',
  },
    {
    title: 'Sports',
    href: '/sports',
    description: 'The latest in local and international sports.',
  },
  {
    title: 'Global Affairs',
    href: '/global-affairs',
    description: 'Insights on global security and defense.',
  },
];


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


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
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {categories.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Link href="/ask-diano" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
        <Mic className="h-4 w-4" /> Ask Diano
      </Link>
      <Link href="/diano-weekly" className="text-muted-foreground hover:text-primary transition-colors">Nations Weekly</Link>
      <Link href="/video" className="text-muted-foreground hover:text-primary transition-colors">Video</Link>
      <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-extrabold tracking-tight text-foreground">Talk of Nations</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks}
        </nav>
        <div className="flex items-center gap-2">
           <ThemeToggle />
           <div className="hidden sm:flex">
             <Button variant="outline" size="icon" asChild>
                  <Link href="/search">
                      <Search className="h-5 w-5" />
                      <span className="sr-only">Search</span>
                  </Link>
             </Button>
           </div>
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
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="p-4">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="text-xl font-extrabold tracking-tight text-foreground">Talk of Nations</span>
                    </Link>
                  <nav className="grid gap-4 text-lg">
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                    {categories.map(cat => (
                       <Link key={cat.href} href={cat.href} className="text-muted-foreground hover:text-primary transition-colors">{cat.title}</Link>
                    ))}
                    <Link href="/ask-diano" className="text-muted-foreground hover:text-primary transition-colors">Ask Diano</Link>
                    <Link href="/diano-weekly" className="text-muted-foreground hover:text-primary transition-colors">Nations Weekly</Link>
                    <Link href="/video" className="text-muted-foreground hover:text-primary transition-colors">Video</Link>
                    <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                  </nav>
                   {!user && !loading && (
                    <div className="mt-8 grid gap-4">
                      <SheetClose asChild>
                         <Button asChild className="w-full">
                           <Link href="/login">
                              <LogIn className="mr-2"/>
                              Login
                           </Link>
                         </Button>
                      </SheetClose>
                       <SheetClose asChild>
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/register">
                              <UserPlus className="mr-2"/>
                              Register
                            </Link>
                          </Button>
                       </SheetClose>
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full">
                            <GoogleIcon className="mr-2 h-4 w-4" />
                            Sign in with Google
                        </Button>
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
