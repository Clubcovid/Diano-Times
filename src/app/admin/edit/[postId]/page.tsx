
import { PostForm } from '@/components/admin/post-form';
import { getPostById } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Post, ContentBlock } from '@/lib/types';

// This is a type guard to check if the post has serializable dates
type SerializablePost = Omit<Post, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

function isSerializable(post: Post): post is SerializablePost {
    return typeof (post.createdAt as any).toDate === 'function';
}

function convertContentToString(content: ContentBlock[] | string): string {
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content.map(block => {
            if (block.type === 'paragraph') {
                return block.value;
            }
            if (block.type === 'image' && block.value.url) {
                return `![${block.value.alt || ''}](${block.value.url})`;
            }
            return '';
        }).join('\n\n');
    }
    return '';
}


export default async function EditPostPage({ params }: { params: { postId: string } }) {
  const post = await getPostById(params.postId);

  if (!post) {
    notFound();
  }
  
  // Convert Timestamps to strings and content to string before passing to the client component
  const serializablePost = {
    ...post,
    content: convertContentToString(post.content),
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
