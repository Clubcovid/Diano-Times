'use server';
/**
 * @fileOverview An AI flow to generate a cover image from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

const GenerateCoverImageInputSchema = z.object({
  prompt: z.string().describe("A descriptive prompt for the image to be generated, usually the blog post title."),
});
export type GenerateCoverImageInput = z.infer<typeof GenerateCoverImageInputSchema>;

const GenerateCoverImageOutputSchema = z.object({
  imageUrl: z.string().url().describe("The data URI of the generated cover image."),
});
export type GenerateCoverImageOutput = z.infer<typeof GenerateCoverImageOutputSchema>;

export async function generateCoverImage(input: GenerateCoverImageInput): Promise<GenerateCoverImageOutput> {
  if (!(await isAiFeatureEnabled('isCoverImageGenerationEnabled'))) {
    throw new Error('AI-powered cover image generation is disabled by the administrator.');
  }
  const result = await generateCoverImageFlow(input);
  return result;
}

const generateCoverImageFlow = ai.defineFlow(
  {
    name: 'generateCoverImageFlow',
    inputSchema: GenerateCoverImageInputSchema,
    outputSchema: GenerateCoverImageOutputSchema,
  },
  async ({ prompt }) => {

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a high-quality, photorealistic cover image for a blog post titled: "${prompt}". The image should be visually appealing and relevant to the topic. Cinematic, dramatic lighting.`,
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return an image.');
    }

    return { imageUrl: media.url };
  }
);
