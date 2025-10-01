
'use client';

import { useEffect, useTransition } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { postSchema, type PostFormData } from '@/lib/schemas';
import type { Post } from '@/lib/types';
import { createPost, updatePost, generateSlug, generateCoverImageAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Save, PlusCircle, Trash2, GripVertical, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const availableTags = ['Fashion', 'Gadgets', 'Lifestyle', 'Technology', 'Wellness', 'Travel', 'Food', 'Business', 'Culture', 'Art', 'Reviews', 'Tips', 'Nairobi', 'Kenya', 'Global Affairs', 'Sports'];

type SerializablePost = Omit<Post, 'createdAt' | 'updatedAt' | 'content'> & {
  createdAt: string;
  updatedAt: string;
  content: any; // react-hook-form needs a flexible type here
};

export function PostForm({ post }: { post?: SerializablePost }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGeneratingSlug, startSlugGeneration] = useTransition();
  const [isGeneratingImage, startImageGeneration] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const isEditing = !!post;

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content && Array.isArray(post.content) && post.content.length > 0 ? post.content : [{ type: 'paragraph', value: '' }],
      coverImage: post?.coverImage || '',
      tags: post?.tags || [],
      status: post?.status || 'draft',
      authorName: post?.authorName || 'George Diano',
      authorImage: post?.authorImage || 'https://picsum.photos/seed/diano-author/100/100',
    },
  });
  
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "content",
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
  };

  const handleGenerateImage = () => {
    const title = form.getValues('title');
    if (!title) {
      toast({ title: 'Title needed', description: 'Please enter a title to generate an image.', variant: 'destructive' });
      return;
    }
    startImageGeneration(async () => {
      const result = await generateCoverImageAction(title);
      if (result.success && result.imageUrl) {
        form.setValue('coverImage', result.imageUrl);
        form.clearErrors('coverImage');
        toast({ title: 'Success', description: 'Cover image generated and URL updated.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  }

  const onSubmit = (data: PostFormData) => {
    startSubmitting(async () => {
      const result = isEditing
        ? await updatePost(post.id, data)
        : await createPost(data);

      if (result.success) {
        toast({ 
          title: 'Success!', 
          description: result.message,
          variant: result.message.includes('failed') ? 'destructive' : 'default',
        });
        router.push('/admin/posts');
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.message || 'Validation failed. Please check the fields.', variant: 'destructive' });
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>Provide the main details for your blog post.</CardDescription>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post Content</CardTitle>
          <CardDescription>Build your article using paragraph and image blocks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start p-4 border rounded-lg bg-muted/50">
                 <div className="flex flex-col gap-2 pt-1">
                    <Button type="button" size="icon" variant="ghost" disabled={index === 0} onClick={() => move(index, index - 1)}>
                        <GripVertical className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 space-y-2">
                  {field.type === 'paragraph' ? (
                    <div>
                      <Label htmlFor={`content.${index}.value`}>Paragraph</Label>
                      <Textarea
                        id={`content.${index}.value`}
                        {...form.register(`content.${index}.value` as const)}
                        rows={6}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Image</Label>
                      <Input
                        placeholder="Image URL"
                        {...form.register(`content.${index}.value.url` as const)}
                      />
                      <Input
                        placeholder="Alt text for accessibility"
                        {...form.register(`content.${index}.value.alt` as const)}
                      />
                    </div>
                  )}
                  {form.formState.errors.content?.[index]?.value && <p className="text-sm text-destructive">{form.formState.errors.content[index]?.value?.message}</p>}
                  {form.formState.errors.content?.[index]?.type === 'image' && form.formState.errors.content?.[index]?.value?.url && <p className="text-sm text-destructive">{form.formState.errors.content[index]?.value?.url?.message}</p>}
                </div>
                <div className="pt-1">
                    <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} className="text-destructive">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
          {form.formState.errors.content?.root && <p className="text-sm text-destructive">{form.formState.errors.content.root.message}</p>}
           {form.formState.errors.content && !form.formState.errors.content.root && (
                <p className="text-sm text-destructive">There are errors in your content blocks.</p>
           )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => append({ type: 'paragraph', value: '' })}>
              <Type className="mr-2 h-4 w-4" /> Add Paragraph
            </Button>
            <Button type="button" variant="outline" onClick={() => append({ type: 'image', value: { url: '', alt: '' } })}>
              <ImageIcon className="mr-2 h-4 w-4" /> Add Image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata & Author</CardTitle>
          <CardDescription>Add extra information to help organize your posts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
             <div className="flex gap-2">
                <Input id="coverImage" {...form.register('coverImage')} placeholder="https://example.com/image.png" />
                <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                </Button>
             </div>
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-2">
             <Skeleton className="h-10 w-32" />
             <Skeleton className="h-10 w-32" />
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
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  );
}
