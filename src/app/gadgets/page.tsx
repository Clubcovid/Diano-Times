import Link from 'next/link';
import { Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPosts } from '@/lib/posts';
import { PostCard } from '@/components/post-card';
import { Suspense } from 'react';
import { TagList } from '@/components/tag-list';
import { getTags } from '@/lib/posts';
import { mockPosts } from '@/lib/mock-data';

async function PostsData({ tag }: { tag?: string }) {
  let posts = await getPosts({ publishedOnly: true, tag: tag || 'Gadgets' });

   if (posts.length === 0) {
    posts = mockPosts.filter(p => p.tags.includes('Gadgets'));
  }

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
    return <TagList tags={tags} activeTag="Gadgets" />;
}

export default function CategoryPage({ searchParams }: { searchParams: { tag?: string } }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold font-headline text-primary">
            Diano Times
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/fashion" className="text-muted-foreground hover:text-primary transition-colors">Fashion</Link>
            <Link href="/gadgets" className="text-foreground hover:text-primary transition-colors">Gadgets</Link>
            <Link href="/lifestyle" className="text-muted-foreground hover:text-primary transition-colors">Lifestyle</Link>
            <Link href="/video" className="text-muted-foreground hover:text-primary transition-colors">Video</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>
          <Button variant="outline">
            <Rss className="mr-2" />
            Subscribe
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Gadgets</h1>
                <p className="text-lg text-muted-foreground mt-2">The latest in tech and electronics</p>
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
