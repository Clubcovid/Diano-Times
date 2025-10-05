
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

const paragraphBlockSchema = z.object({
  type: z.enum(['paragraph']).describe("The type of content block, which must be 'paragraph'."),
  value: z.string().describe('A paragraph of text for the blog post.'),
});

const contentBlockSchema = z.union([paragraphBlockSchema]);


const GeneratePostOutputSchema = z.object({
  title: z.string().describe('The generated title of the blog post.'),
  content: z.array(paragraphBlockSchema).describe('An array of content blocks. The post should be at least 4 paragraphs long.'),
  tags: z.array(z.string()).describe('An array of relevant tags from the provided list.'),
});
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>;


export async function generatePost(input: GeneratePostInput): Promise<GeneratePostOutput> {
  if (!(await isAiFeatureEnabled('isPostGenerationEnabled'))) {
    throw new Error('AI-powered post generation is disabled by the administrator.');
  }
  return generatePostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostPrompt',
  input: {schema: GeneratePostInputSchema},
  output: {schema: GeneratePostOutputSchema},
  prompt: `You are an expert blog post writer and SEO specialist for a Kenyan news and lifestyle blog called "Talk of Nations".

  Your task is to generate the text content for a blog post based on the following topic:
  Topic: {{{topic}}}

  Please adhere to the following guidelines:
  1.  **Title**: Create a catchy, SEO-friendly title for the post.
  2.  **Content**: Create an array of paragraph blocks. It should contain at least 4 paragraph blocks. Do NOT include any image blocks.
  3.  **SEO Keywords**: Naturally weave in relevant keywords throughout the article. Good keywords to consider are: 'Kenyan politics news', 'latest news in Kenya', 'political gossip', 'humorous Kenyan news', 'Talk of Nations blog', 'Africa breaking news', 'government scandals', and 'celebrity gossip Kenya'.
  4.  **Tags**: Choose up to 3 relevant tags from the following list: Fashion, Gadgets, Lifestyle, Technology, Wellness, Travel, Food, Business, Culture, Art, Reviews, Tips, Nairobi, Kenya, Global Affairs, Sports.
  
  Do NOT generate a slug, a cover image, or any image URLs. The user will add images manually.

  The tone should be modern, informative, witty, and tailored for a Kenyan audience.`,
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

