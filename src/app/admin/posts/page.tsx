
import { PostsTable } from '@/components/admin/posts-table';
import { getPosts } from '@/lib/posts';

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Posts</h1>
        <p className="text-muted-foreground">
          View, create, and manage all your blog posts.
        </p>
      </div>
      <PostsTable posts={posts} />
    </div>
  );
}

    