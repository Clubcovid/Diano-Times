import Link from 'next/link';
import { Rss, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogHeader } from '@/components/blog-header';
import { Logo } from '@/components/icons/logo';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">About Talk of Nations</h1>
                    <p className="text-lg text-muted-foreground mt-2">Your source for Kenyan news, lifestyle, and technological trends.</p>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline">
                    <p>
                        Welcome to Talk of Nations, your premier digital destination for insightful news, vibrant lifestyle content, and the latest in technological innovations, all with a distinct Kenyan focus.
                    </p>
                    <p>
                        Our mission is to deliver timely, accurate, and engaging content that matters to you. Whether you're looking for in-depth analysis of current events, tips on the latest fashion trends, reviews of the hottest gadgets, or a glimpse into the rich cultural tapestry of Kenya, Talk of Nations is your trusted source.
                    </p>
                    <p>
                        We are a team of passionate journalists, writers, and creators dedicated to telling the Kenyan story in a modern, dynamic, and authentic way. Join our community and stay informed, inspired, and entertained.
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
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/fashion" className="hover:text-primary transition-colors">Fashion</Link>
                <Link href="/gadgets" className="hover:text-primary transition-colors">Gadgets</Link>
                <Link href="/lifestyle" className="hover:text-primary transition-colors">Lifestyle</Link>
            </nav>
             <div className="flex gap-4">
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
