import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PostsTable } from '@/components/admin/posts-table';
import { getPosts } from '@/lib/posts';
import { PlusCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

async function PostsData() {
    const posts = await getPosts();
    return <PostsTable posts={posts} />;
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts.</p>
        </div>
        <Button asChild>
          <Link href="/admin/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton/>}>
        <PostsData />
      </Suspense>
    </div>
  );
}
