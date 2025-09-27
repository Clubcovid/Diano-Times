
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

const NEWSLETTER_POPUP_KEY = 'diano-times-newsletter-popup-dismissed';

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem(NEWSLETTER_POPUP_KEY);
    if (!hasBeenDismissed) {
      // Show the popup after a delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(NEWSLETTER_POPUP_KEY, 'true');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    // TODO: Integrate with a real newsletter service
    console.log(`Subscribing email: ${email}`);
    toast({
      title: 'Subscription Successful!',
      description: 'Thank you for subscribing to the Talk of Nations newsletter.',
    });
    setEmail('');
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="font-headline text-2xl">Subscribe to Talk of Nations</DialogTitle>
          <DialogDescription>
            Get the latest news, articles, and updates delivered straight to your inbox.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-popup" className="sr-only">Email</Label>
              <Input
                id="email-popup"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-stretch">
            <Button type="submit" className="w-full">Subscribe Now</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
