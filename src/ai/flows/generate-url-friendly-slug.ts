'use server';
/**
 * @fileOverview Generates a URL-friendly slug from a blog post title using an LLM.
 *
 * - generateUrlFriendlySlug - A function that generates the slug.
 * - GenerateUrlFriendlySlugInput - The input type for the generateUrlFriendlySlug function.
 * - GenerateUrlFriendlySlugOutput - The return type for the generateUrlFriendlySlug function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUrlFriendlySlugInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
});
export type GenerateUrlFriendlySlugInput = z.infer<typeof GenerateUrlFriendlySlugInputSchema>;

const GenerateUrlFriendlySlugOutputSchema = z.object({
  slug: z.string().describe('The URL-friendly slug generated from the title.'),
});
export type GenerateUrlFriendlySlugOutput = z.infer<typeof GenerateUrlFriendlySlugOutputSchema>;

export async function generateUrlFriendlySlug(input: GenerateUrlFriendlySlugInput): Promise<GenerateUrlFriendlySlugOutput> {
  return generateUrlFriendlySlugFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUrlFriendlySlugPrompt',
  input: {schema: GenerateUrlFriendlySlugInputSchema},
  output: {schema: GenerateUrlFriendlySlugOutputSchema},
  prompt: `You are an expert in generating URL-friendly slugs.

  Generate a URL-friendly slug from the following blog post title:
  Title: {{{title}}}

  The slug should be lowercase, contain only letters, numbers, and hyphens, and be as concise as possible.`,
});

const generateUrlFriendlySlugFlow = ai.defineFlow(
  {
    name: 'generateUrlFriendlySlugFlow',
    inputSchema: GenerateUrlFriendlySlugInputSchema,
    outputSchema: GenerateUrlFriendlySlugOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
