import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getPosts } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogHeader } from '@/components/blog-header';

export async function generateStaticParams() {
  const posts = await getPosts({ publishedOnly: true });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return (
    <>
      <BlogHeader />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
             <div className="mb-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4">
              {post.title}
            </h1>
            <div className="text-muted-foreground text-sm">
              <span>Published on {format(postDate, 'MMMM d, yyyy')}</span>
            </div>
          </header>
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.coverImage || "https://picsum.photos/seed/diano-fallback/1200/800"}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              data-ai-hint="kenyan culture"
            />
          </div>
          <div
            className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline prose-headings:text-primary prose-a:text-accent-foreground prose-a:transition-colors hover:prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <footer className="bg-muted text-muted-foreground py-12 mt-12">
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
    </>
  );
}
