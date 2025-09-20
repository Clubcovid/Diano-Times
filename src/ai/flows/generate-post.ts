
'use server';
/**
 * @fileOverview Generates a full blog post from a topic using an LLM.
 *
 * - generatePost - A function that generates the post.
 * - GeneratePostInput - The input type for the generatePost function.
 * - GeneratePostOutput - The return type for the generatePost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { createPost, generateSlug } from '@/lib/actions';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

const GeneratePostInputSchema = z.object({
  topic: z.string().describe('The topic for the blog post.'),
});
export type GeneratePostInput = z.infer<typeof GeneratePostInputSchema>;

const GeneratePostOutputSchema = z.object({
  title: z.string().describe('The generated title of the blog post.'),
  slug: z.string().describe('The URL-friendly slug for the post.'),
  content: z.string().describe('The full content of the blog post in Markdown format.'),
  tags: z.array(z.string()).describe('An array of relevant tags from the provided list.'),
  coverImage: z.string().url().describe('A URL for a relevant cover image from an image service like Unsplash or Pexels.'),
});
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>;


export async function generatePost(input: GeneratePostInput): Promise<GeneratePostOutput> {
  if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
    throw new Error('AI-powered post generation is disabled by the administrator.');
  }
  return generatePostFlow(input);
}

export async function generateDraftPost(topic: string): Promise<{success: boolean, message: string, postId?: string}> {
    try {
        if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
            return { success: false, message: 'AI-powered post generation is disabled by the administrator.' };
        }
        const postData = await generatePost({ topic });
        const { success: slugSuccess, slug, error: slugError } = await generateSlug(postData.slug);

        if (!slugSuccess || !slug) {
            return { success: false, message: slugError || 'Failed to generate a unique slug.' };
        }

        const result = await createPost({
            ...postData,
            slug,
            status: 'draft',
        });

        if (result.success) {
            return { success: true, message: 'Draft created', postId: result.postId };
        } else {
            return { success: false, message: result.message };
        }

    } catch (e: any) {
        return { success: false, message: e.message || 'An unknown error occurred.' };
    }
}


const prompt = ai.definePrompt({
  name: 'generatePostPrompt',
  input: {schema: GeneratePostInputSchema},
  output: {schema: GeneratePostOutputSchema},
  prompt: `You are an expert blog post writer for a Kenyan news and lifestyle blog called "Diano Times".

  Your task is to generate a complete, engaging, and well-structured blog post based on the following topic:
  Topic: {{{topic}}}

  Please adhere to the following guidelines:
  1.  **Title**: Create a catchy, SEO-friendly title for the post.
  2.  **Slug**: Generate a URL-friendly slug (lowercase, hyphens for spaces, no special characters).
  3.  **Content**: Write the post content in Markdown format. It should be at least 4 paragraphs long and include headings, lists, or other formatting to make it readable.
  4.  **Tags**: Choose up to 3 relevant tags from the following list: Fashion, Gadgets, Lifestyle, Technology, Wellness, Travel, Food, Business, Culture, Art, Reviews, Tips, Nairobi, Kenya, Global Affairs, Sports.
  5.  **Cover Image**: Provide a URL for a high-quality, relevant cover image. Use a placeholder from picsum.photos with a unique seed (e.g., https://picsum.photos/seed/your-topic-slug/1200/800).
  
  The tone should be modern, informative, and tailored for a Kenyan audience.`,
});

const generatePostFlow = ai.defineFlow(
  {
    name: 'generatePostFlow',
    inputSchema: GeneratePostInputSchema,
    outputSchema: GeneratePostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
