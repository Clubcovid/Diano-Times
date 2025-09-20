
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Mail, Save } from 'lucide-react';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/actions';
import { BlogHeader } from '@/components/blog-header';

const ADMIN_EMAIL = 'georgedianoh@gmail.com';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, loading, router]);

  const handleSubmit = async (formData: FormData) => {
    const result = await updateUserProfile(null, formData);
     if (result.message) {
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        // This is a bit of a hack to force a refresh of the user object
        // A more robust solution might involve a dedicated user refresh function in the auth context
        await auth.currentUser?.reload();
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    }
  };


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

  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <BlogHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-headline">{user.displayName || 'Welcome'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <form action={handleSubmit} className="space-y-4">
                <h3 className="font-semibold text-lg">Edit Profile</h3>
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground"/>
                        <Input 
                            id="displayName" 
                            name="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                     <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground"/>
                        <Input value={user.email || ''} disabled />
                    </div>
                </div>
                <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-6">
              {isAdmin && (
                <Button asChild variant="secondary">
                    <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
               <Button onClick={handleSignOut} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
