
import Link from 'next/link';
import { Rss, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogHeader } from '@/components/blog-header';
import { Logo } from '@/components/icons/logo';

export default function RightsAndPermissionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Rights & Permissions</h1>
                    <p className="text-lg text-muted-foreground mt-2">Our commitment to journalistic integrity and legal compliance.</p>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline">
                    <h2>Our Stance</h2>
                    <p>
                        Talk of Nations is committed to upholding the principles of free press and journalistic integrity as enshrined in the Constitution of Kenya, particularly Article 33 (Freedom of Expression) and Article 34 (Freedom of the Media). We strive to provide news, commentary, and analysis that is truthful, fair, and accurate.
                    </p>
                    
                    <h2>Limitation of Liability</h2>
                    <p>
                        The views and opinions expressed in articles, opinion pieces, and comments on this site are those of the authors and do not necessarily reflect the official policy or position of Talk of Nations. While we strive for accuracy, we shall not be held liable for any errors, omissions, or the results obtained from the use of this information. All information is provided on an "as is" basis with no guarantee of completeness, accuracy, or timeliness.
                    </p>

                    <h2>Protection from Legal Implications (Kenyan Law)</h2>
                    <p>
                        In accordance with the laws of Kenya, including the Defamation Act (Cap. 36), we operate with an understanding of the balance between freedom of expression and the protection of reputations. Our content is published in good faith and, where applicable, constitutes fair comment on matters of public interest.
                    </p>
                    <p>
                        We take reasonable care to avoid publishing defamatory statements. In cases where content is user-generated or from third parties, Talk of Nations acts as a platform and will take appropriate action as required by law upon receiving a valid complaint.
                    </p>

                    <h2>Copyright and Fair Use</h2>
                    <p>
                        All original content, including articles, images, and logos on Talk of Nations, is the property of the site owner unless otherwise stated. Unauthorized reproduction is prohibited. We may, at times, use excerpts of copyrighted material under the "fair dealing" provisions of the Copyright Act of Kenya for purposes such as criticism, comment, news reporting, and research.
                    </p>
                    
                    <h2>Contact and Takedown Requests</h2>
                    <p>
                        If you believe that any content on this site infringes on your rights or is inaccurate, please contact us immediately via our <Link href="/contact">contact page</Link>. We will investigate all valid claims and take appropriate action.
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
