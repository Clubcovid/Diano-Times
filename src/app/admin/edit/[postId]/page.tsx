import { PostForm } from '@/components/admin/post-form';
import { getPostById } from '@/lib/posts';
import { notFound } from 'next/navigation';

export default async function EditPostPage({ params }: { params: { postId: string } }) {
  const post = await getPostById(params.postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Edit Post</h1>
        <p className="text-muted-foreground">Update the details of your blog post.</p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
