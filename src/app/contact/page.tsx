import Link from 'next/link';
import { Mail, Phone, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BlogHeader } from '@/components/blog-header';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Contact Us</h1>
                <p className="text-lg text-muted-foreground mt-2">We'd love to hear from you. Get in touch with us.</p>
            </div>
            
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>
                                Reach out to us via email, phone, or find us on social media.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Mail className="h-6 w-6 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Email</h3>
                                    <a href="mailto:info@talkofnations.com" className="text-muted-foreground hover:text-primary">info@talkofnations.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-6 w-6 text-primary" />
                                <div>
                                    <h3 className="font-semibold">Phone</h3>
                                    <a href="tel:0700000000" className="text-muted-foreground hover:text-primary">0700000000</a>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="flex gap-4 text-primary">
                                    <a href="#" className="hover:text-foreground"><Instagram /></a>
                                    <a href="#" className="hover:text-foreground"><Twitter /></a>
                                    <a href="#" className="hover:text-foreground"><Facebook /></a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Your name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="Your email" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="Subject of your message" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Your message" rows={6} />
                                </div>
                                <Button type="submit">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-muted text-muted-foreground py-12">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Talk of Nations</h3>
            <p className="text-sm">Your source for Kenyan news, lifestyle, and technological trends.</p>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Categories</h3>
             <ul className="space-y-2 text-sm">
                <li><Link href="/fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
                <li><Link href="/gadgets" className="hover:text-primary transition-colors">Gadgets</Link></li>
                <li><Link href="/lifestyle" className="hover:text-primary transition-colors">Lifestyle</Link></li>
             </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Follow Us</h3>
            <div className="flex gap-4">
                <a href="#" className="hover:text-primary"><Instagram /></a>
                <a href="#" className="hover:text-primary"><Twitter /></a>
                <a href="#" className="hover:text-primary"><Facebook /></a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-sm border-t border-border pt-6">
          &copy; {new Date().getFullYear()} Talk of Nations. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
