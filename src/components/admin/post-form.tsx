
'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Skeleton } from '@/components/ui/skeleton';

const availableTags = ['Fashion', 'Gadgets', 'Lifestyle', 'Technology', 'Wellness', 'Travel', 'Food', 'Business', 'Culture', 'Art', 'Reviews', 'Tips', 'Nairobi', 'Kenya', 'Global Affairs', 'Sports'];

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
      coverImage: post?.coverImage || '',
      tags: post?.tags || [],
      status: post?.status || 'draft',
      authorName: post?.authorName || 'Talk of Nations Staff',
      authorImage: post?.authorImage || 'https://picsum.photos/seed/diano-author/100/100',
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
        const result = isEditing
            ? await updatePost(post.id, data)
            : await createPost(data);

        if (result.success) {
            toast({
                title: 'Success!',
                description: result.message,
            });
            router.push('/admin/posts');
            router.refresh();
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
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
            <Textarea id="content" {...form.register('content')} rows={15} placeholder="Write your post content here. Markdown is supported. To add an image, use ![alt text](image_url)"/>
            {form.formState.errors.content && <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata & Author</CardTitle>
          <CardDescription>
            Add extra information to help organize your posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input id="coverImage" {...form.register('coverImage')} placeholder="https://example.com/image.png" />
            {form.formState.errors.coverImage && <p className="text-sm text-destructive">{form.formState.errors.coverImage.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name</Label>
              <Input id="authorName" {...form.register('authorName')} />
              {form.formState.errors.authorName && <p className="text-sm text-destructive">{form.formState.errors.authorName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorImage">Author Image URL</Label>
              <Input id="authorImage" {...form.register('authorImage')} />
              {form.formState.errors.authorImage && <p className="text-sm text-destructive">{form.formState.errors.authorImage.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={field.value?.includes(tag)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), tag])
                            : field.onChange(field.value?.filter((value) => value !== tag));
                        }}
                      />
                      <Label htmlFor={`tag-${tag}`} className="font-normal">{tag}</Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {form.formState.errors.tags && <p className="text-sm text-destructive">{form.formState.errors.tags.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
             <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
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

export function PostFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-2/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    </div>
  )
}
