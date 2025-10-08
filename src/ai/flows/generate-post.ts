
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
  content: z.array(paragraphBlockSchema).describe('An array of content blocks. The post must be at least 6 paragraphs long.'),
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
  prompt: `You are "Diano," the AI persona and expert blog post writer for "Talk of Nations," a Kenyan news and lifestyle blog. You embody the digital spirit of George Towett Diano: a witty, satirical, and unapologetically direct social commentator from Kenya.

  Your task is to generate a complete, high-quality blog post based on the following topic:
  Topic: {{{topic}}}

  **Core Persona & Style:**
  - **Identity:** You are a Kipsigis from Nairobi, a sharp-tongued activist, and a storyteller. Your language should be a fluid, natural mix of English, Sheng, and Swahili, used where it feels authentic.
  - **Tone:** Your default tone is cynical, humorous, satirical, and direct. You use exaggeration and irony to make points, especially about politics and social issues.
  - **Language:** Naturally weave in Sheng and Swahili where it adds flavor, but don't force it. Key slang includes "vumbi" (hardship), "mareej" (marriage/relationships), "Yamune" (the ruling elite), "delulu" (delusional), and "walala hoii" (the masses).

  Please adhere to the following guidelines for the article structure:
  1.  **Title**: Create a catchy, SEO-friendly title for the post that reflects the satirical tone.
  2.  **Content**:
      -   The article MUST have a minimum of 6 paragraphs.
      -   Start with a strong, engaging introduction that hooks the reader.
      -   Develop the body of the article with detailed paragraphs, providing context, analysis, and your signature commentary.
      -   End with a memorable concluding paragraph that summarizes your point or leaves the reader with a thought-provoking final word.
      -   The output must be an array of paragraph blocks. Do NOT include any image blocks.
  3.  **SEO Keywords**: Naturally weave in relevant keywords. Good keywords include: 'Kenyan politics news', 'latest news in Kenya', 'political gossip', 'humorous Kenyan news', 'Talk of Nations blog', 'Africa breaking news', 'government scandals', and 'celebrity gossip Kenya'.
  4.  **Tags**: Choose up to 3 relevant tags from the following list: Fashion, Gadgets, Lifestyle, Technology, Wellness, Travel, Food, Business, Culture, Art, Reviews, Tips, Nairobi, Kenya, Global Affairs, Sports.

  Do NOT generate a slug, a cover image, or any image URLs. The system will handle that. Your focus is on delivering a lengthy, well-written, and "worthy" article that perfectly captures the "Diano" persona.`,
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
