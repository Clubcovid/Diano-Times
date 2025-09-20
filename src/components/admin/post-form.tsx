
'use client';

import { useState, useTransition } from 'react';
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
import { Wand2, Save, Upload, X } from 'lucide-react';
import Image from 'next/image';

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
  const [imagePreview, setImagePreview] = useState<string | null>(post?.coverImage || null);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      coverImage: post?.coverImage || '',
      tags: post?.tags || [],
      status: post?.status || 'draft',
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ title: 'Image too large', description: 'Please upload an image smaller than 4MB.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('coverImage', result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'tags' && Array.isArray(value)) {
                value.forEach(tag => formData.append(key, tag));
            } else if (value !== undefined) {
                formData.append(key, value as string);
            }
        });

        const result = isEditing
            ? await updatePost(post.id, formData)
            : await createPost(formData);

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
            <Label>Cover Image</Label>
            {imagePreview ? (
              <div className="relative group">
                <Image src={imagePreview} alt="Cover image preview" width={400} height={200} className="rounded-md object-cover border" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setImagePreview(null);
                    form.setValue('coverImage', '');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label htmlFor="cover-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 4MB)</p>
                    </div>
                    <Input id="cover-image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                </label>
            </div> 
            )}
            {form.formState.errors.coverImage && <p className="text-sm text-destructive">{form.formState.errors.coverImage.message}</p>}
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
