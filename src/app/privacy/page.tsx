import Link from 'next/link';
import { Rss, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogHeader } from '@/components/blog-header';
import { Logo } from '@/components/icons/logo';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Privacy Policy</h1>
                    <p className="text-lg text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline">
                    <p>
                        Talk of Nations ("us", "we", or "our") operates the https://talkofnations.com website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                    </p>
                    
                    <h2>Information Collection and Use</h2>
                    <p>
                        We collect several different types of information for various purposes to provide and improve our Service to you.
                    </p>

                    <h3>Types of Data Collected</h3>
                    <h4>Personal Data</h4>
                    <p>
                        While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, Cookies and Usage Data.
                    </p>
                    
                    <h2>Use of Data</h2>
                    <p>Talk of Nations uses the collected data for various purposes:</p>
                    <ul>
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                        <li>To provide customer care and support</li>
                        <li>To provide analysis or valuable information so that we can improve the Service</li>
                        <li>To monitor the usage of the Service</li>
                        <li>To detect, prevent and address technical issues</li>
                    </ul>

                    <h2>Changes to This Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us by visiting the <Link href="/contact">contact page</Link> on our website.
                    </p>
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-muted text-muted-foreground py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">Talk of Nations</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                  <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                  <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                  <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                  <Link href="/rights-and-permissions" className="hover:text-primary transition-colors">Rights & Permissions</Link>
              </nav>
              <div className="flex gap-4 md:hidden">
                  <a href="#" className="hover:text-primary" aria-label="Instagram"><Instagram /></a>
                  <a href="https://x.com/TalkofNations?t=Z7MSDp3fplIqkuqYzTrxJw&s=09" target="_blank" rel="noopener noreferrer" className="hover:text-primary" aria-label="Twitter"><Twitter /></a>
                  <a href="#" className="hover:text-primary" aria-label="Facebook"><Facebook /></a>
              </div>
            </div>
             <div className="hidden md:flex gap-4">
                <a href="#" className="hover:text-primary" aria-label="Instagram"><Instagram /></a>
                <a href="https://x.com/TalkofNations?t=Z7MSDp3fplIqkuqYzTrxJw&s=09" target="_blank" rel="noopener noreferrer" className="hover:text-primary" aria-label="Twitter"><Twitter /></a>
                <a href="#" className="hover:text-primary" aria-label="Facebook"><Facebook /></a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm border-t border-border pt-6">
            &copy; {new Date().getFullYear()} Talk of Nations. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
