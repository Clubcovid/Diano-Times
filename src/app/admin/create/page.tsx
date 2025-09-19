import { PostForm } from '@/components/admin/post-form';

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Create New Post</h1>
        <p className="text-muted-foreground">Fill in the details below to create a new blog post.</p>
      </div>
      <PostForm />
    </div>
  );
}
