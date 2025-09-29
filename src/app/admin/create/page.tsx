
'use client';

import { Suspense } from 'react';
import { PostFormSkeleton } from '@/components/admin/post-form';
import dynamic from 'next/dynamic'

const DynamicPostForm = dynamic(() => import('@/components/admin/post-form').then(mod => mod.PostForm), {
  loading: () => <PostFormSkeleton />,
  ssr: false,
});


export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Create New Post</h1>
        <p className="text-muted-foreground">Fill in the details below to create a new blog post.</p>
      </div>
      <Suspense fallback={<PostFormSkeleton />}>
        <DynamicPostForm />
      </Suspense>
    </div>
  );
}
