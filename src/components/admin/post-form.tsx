
'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { postSchema, type PostFormData } from '@/lib/schemas';
import type { Post } from '@/lib/types';
import { createPost, updatePost, generateSlug } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Save } from 'lucide-react';

const availableTags = ['Fashion', 'Gadgets', 'Lifestyle', 'Technology', 'Wellness', 'Travel', 'Food', 'Business', 'Culture', 'Art', 'Reviews', 'Tips', 'Nairobi', 'Kenya'];

type SerializablePost = Omit<Post, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export function PostForm({ post }: { post?: SerializablePost }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGeneratingSlug, startSlugGeneration] = useTransition();
  const [isSubmitting, startTransition] = useTransition();
  const isEditing = !!post;

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      coverImage: post?.coverImage || 'https://picsum.photos/seed/diano-blog-1/1200/800',
      tags: post?.tags || [],
      status: post?.status || 'draft',
    },
  });

  const handleGenerateSlug = () => {
    const title = form.getValues('title');
    if (!title) {
        toast({ title: 'Title needed', description: 'Please enter a title to generate a slug.', variant: 'destructive' });
        return;
    }
    startSlugGeneration(async () => {
        const result = await generateSlug(title);
        if (result.success && result.slug) {
            form.setValue('slug', result.slug);
            form.clearErrors('slug');
            toast({ title: 'Success', description: 'Slug generated successfully.' });
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    });
  }

  const onSubmit = (data: PostFormData) => {
    startTransition(async () => {
        const action = isEditing
            ? updatePost.bind(null, post.id, data)
            : createPost.bind(null, data);

        const result = await action();

        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
            router.push('/admin/posts');
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
            if (result.errors) {
                result.errors.forEach(error => {
                    form.setError(error.path[0] as keyof PostFormData, { message: error.message });
                });
            }
        }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Provide the main details for your blog post.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex gap-2">
              <Input id="slug" {...form.register('slug')} />
              <Button type="button" variant="outline" onClick={handleGenerateSlug} disabled={isGeneratingSlug}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isGeneratingSlug ? 'Generating...' : 'Generate'}
              </Button>
            </div>
            {form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" {...form.register('content')} rows={15} placeholder="Write your post content here. Markdown is supported."/>
            {form.formState.errors.content && <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>
            Add extra information to help organize your posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input id="coverImage" {...form.register('coverImage')} placeholder="https://example.com/image.jpg"/>
            {form.formState.errors.coverImage && <p className="text-sm text-destructive">{form.formState.errors.coverImage.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                        <Checkbox
                            id={`tag-${tag}`}
                            onCheckedChange={(checked) => {
                                const currentTags = form.getValues('tags') || [];
                                const newTags = checked
                                    ? [...currentTags, tag]
                                    : currentTags.filter((t) => t !== tag);
                                form.setValue('tags', newTags, { shouldValidate: true });
                            }}
                            checked={form.watch('tags')?.includes(tag)}
                        />
                        <Label htmlFor={`tag-${tag}`} className="font-normal">{tag}</Label>
                    </div>
                ))}
            </div>
            {form.formState.errors.tags && <p className="text-sm text-destructive">{form.formState.errors.tags.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => form.setValue('status', value as 'draft' | 'published')} defaultValue={form.getValues('status')}>
                <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                </SelectContent>
            </Select>
            {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
