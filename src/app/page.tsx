import { BlogHeader } from '@/components/blog-header';
import { PostCard } from '@/components/post-card';
import { TagList } from '@/components/tag-list';
import { getPosts, getTags } from '@/lib/posts';
import type { Post } from '@/lib/types';
import { Suspense } from 'react';

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
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function PostsList({ tag }: { tag?: string }) {
  const posts = await getPosts({ publishedOnly: true, tag });

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <h2 className="text-2xl font-bold font-headline">No posts found</h2>
        <p className="text-muted-foreground mt-2">
          {tag
            ? `There are no posts for the tag "${tag}".`
            : "It looks like there are no published posts yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post as Post} />
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { tag?: string };
}) {
  const tags = await getTags();
  
  return (
    <div className="flex flex-col min-h-screen">
      <BlogHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <section className="text-center py-12">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter">
              Diano Blog
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Creativity, innovation, and digital media. Explore thoughts on the modern web.
            </p>
          </section>

          {tags.length > 0 && (
            <aside className="mb-12">
              <TagList tags={tags} activeTag={searchParams?.tag} />
            </aside>
          )}

          <Suspense fallback={<PostsSkeleton />}>
            <PostsList tag={searchParams?.tag} />
          </Suspense>
        </div>
      </main>
      <footer className="py-6 border-t mt-12">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Diano Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
