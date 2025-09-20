
import { z } from 'zod';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imageSchema = z.string().refine(
  (data) => {
    if (data.startsWith('data:image')) {
      // It's a base64 string
      const sizeInBytes = (data.length * (3 / 4)) - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
      return sizeInBytes <= MAX_IMAGE_SIZE;
    }
    // It's a URL
    return z.string().url().safeParse(data).success || data === '';
  },
  `Image size must be less than 4MB.`
);

export const postSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  slug: z.string()
    .min(3, { message: 'Slug must be at least 3 characters long.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be URL-friendly (e.g., "my-first-post").' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters long.' }),
  coverImage: imageSchema.or(z.literal('')),
  tags: z.array(z.string()).refine(value => value.length > 0, {
    message: 'You have to select at least one tag.',
  }),
  status: z.enum(['draft', 'published']),
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
