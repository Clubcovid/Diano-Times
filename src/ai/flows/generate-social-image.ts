
'use server';
/**
 * @fileOverview An AI flow to generate a branded social media image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSocialImageInputSchema = z.object({
  imageUrl: z.string().url().describe("The URL of the image to be branded."),
});
export type GenerateSocialImageInput = z.infer<typeof GenerateSocialImageInputSchema>;

const GenerateSocialImageOutputSchema = z.object({
  brandedImageUrl: z.string().url().describe("The data URI of the generated branded image."),
});
export type GenerateSocialImageOutput = z.infer<typeof GenerateSocialImageOutputSchema>;

export async function generateSocialImage(input: GenerateSocialImageInput): Promise<GenerateSocialImageOutput> {
  const result = await generateSocialImageFlow(input);
  return result;
}

const generateSocialImageFlow = ai.defineFlow(
  {
    name: 'generateSocialImageFlow',
    inputSchema: GenerateSocialImageInputSchema,
    outputSchema: GenerateSocialImageOutputSchema,
  },
  async ({ imageUrl }) => {

    const logoUrl = 'https://www.talkofnations.com/logo-white.png'; // Assume a white version of the logo exists

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        { media: { url: imageUrl } },
        {
          text: `
            Create a professional and clean social media graphic (1200x675 pixels).
            - Use the provided image as the main background. The image may need to be cropped or resized to fit.
            - Place a semi-transparent black overlay on the bottom third of the image to ensure text is readable.
            - In the bottom left corner, place the text "Talk of Nations" in a clean, modern, white sans-serif font.
            - Below the text "Talk of Nations", place smaller icons for Twitter, Facebook, and Instagram, also in white.
            - Do not include any other text or logos.
          `,
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return an image.');
    }

    return { brandedImageUrl: media.url };
  }
);
