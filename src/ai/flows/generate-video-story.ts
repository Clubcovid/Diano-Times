'use server';
/**
 * @fileOverview A flow that generates a video from a story.
 * It first generates an image of the main character and then animates it.
 *
 * - generateVideoStory - The function that orchestrates the video generation.
 * - GenerateVideoStoryInput - The input type for the function.
 * - GenerateVideoStoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as fs from 'fs';
import {Readable} from 'stream';
import type {MediaPart} from 'genkit';

const GenerateVideoStoryInputSchema = z.object({
  story: z
    .string()
    .describe('A short story or description to be turned into a video.'),
  characterDescription: z
    .string()
    .describe('A detailed description of the main character.'),
});
export type GenerateVideoStoryInput = z.infer<
  typeof GenerateVideoStoryInputSchema
>;

const GenerateVideoStoryOutputSchema = z.object({
  video: z.string().describe('The generated video as a base64 data URI.'),
});
export type GenerateVideoStoryOutput = z.infer<
  typeof GenerateVideoStoryOutputSchema
>;

async function downloadVideo(video: MediaPart): Promise<string> {
  const fetch = (await import('node-fetch')).default;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set.');
  }

  const videoDownloadResponse = await fetch(
    `${video.media!.url}&key=${apiKey}`
  );
  if (
    !videoDownloadResponse ||
    videoDownloadResponse.status !== 200 ||
    !videoDownloadResponse.body
  ) {
    throw new Error('Failed to fetch video');
  }

  const buffer = await videoDownloadResponse.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

export async function generateVideoStory(
  input: GenerateVideoStoryInput
): Promise<GenerateVideoStoryOutput> {
  const flow = ai.defineFlow(
    {
      name: 'generateVideoStoryFlow',
      inputSchema: GenerateVideoStoryInputSchema,
      outputSchema: GenerateVideoStoryOutputSchema,
    },
    async ({story, characterDescription}) => {
      // Step 1: Generate an image of the character.
      const {media: characterImage} = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Generate a photorealistic image of a character based on this description: ${characterDescription}`,
      });

      if (!characterImage || !characterImage.url) {
        throw new Error('Failed to generate character image.');
      }

      // Step 2: Use the generated image to create a video.
      let {operation} = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: [
          {
            text: `Animate this character. The scene is based on the following story: ${story}`,
          },
          {
            media: {
              url: characterImage.url,
            },
          },
        ],
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });

      if (!operation) {
        throw new Error('Expected the model to return an operation');
      }

      // Step 3: Poll for video completion.
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.checkOperation(operation);
      }

      if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
      }

      const videoPart = operation.output?.message?.content.find(p => !!p.media);
      if (!videoPart) {
        throw new Error('Failed to find the generated video');
      }

      // Step 4: Download the video and return as a data URI.
      const videoBase64 = await downloadVideo(videoPart);
      return {
        video: `data:video/mp4;base64,${videoBase64}`,
      };
    }
  );

  return await flow(input);
}
