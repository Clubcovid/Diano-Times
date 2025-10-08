
import Link from 'next/link';
import { Rss, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPosts } from '@/lib/posts';
import { PostCard } from '@/components/post-card';
import { Suspense } from 'react';
import { TagList } from '@/components/tag-list';
import { getTags } from '@/lib/posts';
import { BlogHeader } from '@/components/blog-header';
import { Logo } from '@/components/icons/logo';

async function PostsData({ tag }: { tag?: string }) {
  let posts = await getPosts({ publishedOnly: true, tag: tag || 'Sports' });

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <h2 className="text-2xl font-bold font-headline">No posts found</h2>
        <p className="text-muted-foreground mt-2">
          It looks like there are no published posts in this category yet.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function Tags() {
    const tags = await getTags();
    return <TagList tags={tags} activeTag="Sports" />;
}

export default function CategoryPage({ searchParams }: { searchParams: { tag?: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Sports</h1>
                <p className="text-lg text-muted-foreground mt-2">The latest in local and international sports</p>
            </div>
             <div className="mb-8">
                <Suspense>
                    <Tags />
                </Suspense>
            </div>
            <Suspense fallback={<PostsSkeleton />}>
                <PostsData tag={searchParams.tag} />
            </Suspense>
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
