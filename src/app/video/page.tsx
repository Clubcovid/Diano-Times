
import Link from 'next/link';
import { getVideos } from '@/lib/actions';
import { BlogHeader } from '@/components/blog-header';
import { VideoGrid } from '@/components/video-grid';
import type { Video } from '@/lib/types';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { Logo } from '@/components/icons/logo';

// This is a type guard to check if the video has serializable dates
type SerializableVideo = Omit<Video, 'createdAt'> & {
  createdAt: string;
};

export default async function VideoPage() {
  const videos: Video[] = await getVideos();

  const serializableVideos: SerializableVideo[] = videos.map(video => ({
    ...video,
    createdAt: video.createdAt?.toDate ? video.createdAt.toDate().toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Videos</h1>
                <p className="text-lg text-muted-foreground mt-2">Watch our latest videos</p>
            </div>
            
            <VideoGrid videos={serializableVideos} />

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
