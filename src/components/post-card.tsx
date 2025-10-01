import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/lib/types';
import { format } from 'date-fns';

export function PostCard({ post }: { post: Post }) {
  const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <Card className="h-full flex flex-col group overflow-hidden transition-all duration-300 ease-in-out border-0 shadow-none hover:shadow-xl rounded-lg">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform group-hover:scale-105 duration-300 ease-in-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint="kenyan life"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 bg-card rounded-b-lg">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-2">
                <Badge variant="secondary" className="text-primary">{post.tags[0]}</Badge>
            </div>
          )}
          <CardTitle className="font-headline text-lg leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <p className="text-muted-foreground text-xs mt-2">
            {format(postDate, 'MMMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
