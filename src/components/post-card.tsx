import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from '@/lib/types';
import { format } from 'date-fns';

export function PostCard({ post }: { post: Post }) {
  const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <Card className="h-full flex flex-col group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300 ease-in-out">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={post.coverImage || "https://picsum.photos/seed/diano-fallback/1200/800"}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105 duration-300 ease-in-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <CardTitle className="font-headline text-xl leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {format(postDate, 'MMMM d, yyyy')}
          </p>
        </CardContent>
        {post.tags && post.tags.length > 0 && (
          <CardFooter className="p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
