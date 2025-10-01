

import { PostForm } from '@/components/admin/post-form';
import { getPostById } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Post, ContentBlock } from '@/lib/types';

// This is a type guard to check if the post has serializable dates
type SerializablePost = Omit<Post, 'createdAt' | 'updatedAt' | 'content'> & {
  createdAt: string;
  updatedAt: string;
  content: ContentBlock[];
};


function convertContentToBlocks(content: ContentBlock[] | string): ContentBlock[] {
    if (typeof content === 'string') {
        return content.split('\n\n').filter(p => p.trim() !== '').map(p => ({ type: 'paragraph', value: p }));
    }
    return content;
}


export default async function EditPostPage({ params }: { params: { postId: string } }) {
  const post = await getPostById(params.postId);

  if (!post) {
    notFound();
  }
  
  // Convert Timestamps to strings and content to string before passing to the client component
  const serializablePost: SerializablePost = {
    ...post,
    content: convertContentToBlocks(post.content),
    createdAt: post.createdAt.toDate().toISOString(),
    updatedAt: post.updatedAt.toDate().toISOString(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Edit Post</h1>
        <p className="text-muted-foreground">Update the details of your blog post.</p>
      </div>
      <PostForm post={serializablePost} />
    </div>
  );
}
