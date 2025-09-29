
import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  slug: z.string()
    .min(3, { message: 'Slug must be at least 3 characters long.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be URL-friendly (e.g., "my-first-post").' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters long.' }),
  coverImage: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  tags: z.array(z.string()).min(1, { message: 'You have to select at least one tag.' }),
  status: z.enum(['draft', 'published']),
  authorName: z.string().min(3, { message: 'Author name is required.' }),
  authorImage: z.string().url({ message: 'Please enter a valid URL for the author image.' }).or(z.literal('')),
});

export type PostFormData = z.infer<typeof postSchema>;

export const adSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  linkUrl: z.string().url('Please enter a valid link URL.'),
});

export type AdFormData = z.infer<typeof adSchema>;

const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

export const videoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  youtubeUrl: z.string().regex(youtubeUrlRegex, 'Please enter a valid YouTube URL.'),
});

export type VideoFormData = z.infer<typeof videoSchema>;
