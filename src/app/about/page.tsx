import Link from 'next/link';
import { Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogHeader } from '@/components/blog-header';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">About Diano Times</h1>
                    <p className="text-lg text-muted-foreground mt-2">Your source for Kenyan news, lifestyle, and technological trends.</p>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline">
                    <p>
                        Welcome to Diano Times, your premier digital destination for insightful news, vibrant lifestyle content, and the latest in technological innovations, all with a distinct Kenyan focus.
                    </p>
                    <p>
                        Our mission is to deliver timely, accurate, and engaging content that matters to you. Whether you're looking for in-depth analysis of current events, tips on the latest fashion trends, reviews of the hottest gadgets, or a glimpse into the rich cultural tapestry of Kenya, Diano Times is your trusted source.
                    </p>
                    <p>
                        We are a team of passionate journalists, writers, and creators dedicated to telling the Kenyan story in a modern, dynamic, and authentic way. Join our community and stay informed, inspired, and entertained.
                    </p>
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-muted text-muted-foreground py-12">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4">Diano Times</h3>
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
            {/* Add Social media icons here */}
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-8 text-center text-sm border-t border-border pt-6">
          &copy; {new Date().getFullYear()} Diano Times. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
