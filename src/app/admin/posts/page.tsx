
import { PostsTable } from '@/components/admin/posts-table';
import { getPosts } from '@/lib/posts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Posts</h1>
          <p className="text-muted-foreground">
            View, create, and manage all your blog posts.
          </p>
        </div>
        <Button asChild>
            <Link href="/admin/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Post
            </Link>
        </Button>
      </div>
      <PostsTable posts={posts} />
    </div>
  );
}
