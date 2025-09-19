import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, getPosts } from '@/lib/posts';
import { BlogHeader } from '@/components/blog-header';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
          <header className="mb-8">
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-primary border-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4 text-primary-foreground bg-primary p-2 rounded-md">
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
            />
          </div>
          <div
            className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-headline prose-headings:text-primary prose-a:text-accent prose-a:transition-colors hover:prose-a:text-accent/80"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Diano Blog. All rights reserved.
        </div>
      </footer>
    </>
  );
}
