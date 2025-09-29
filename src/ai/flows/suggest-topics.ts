
'use server';
/**
 * @fileOverview Suggests blog post topics for Talk of Nations.
 *
 * This flow generates a list of relevant and engaging blog post topics
 * tailored for a Kenyan audience.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

const SuggestTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('A list of 5 engaging and SEO-friendly blog post topics.'),
});
export type SuggestTopicsOutput = z.infer<typeof SuggestTopicsOutputSchema>;

export async function suggestTopics(): Promise<SuggestTopicsOutput> {
  if (!(await isAiFeatureEnabled('isTopicSuggestionEnabled'))) {
    throw new Error('AI-powered topic suggestion is disabled by the administrator.');
  }
  return suggestTopicsFlow();
}

const prompt = ai.definePrompt({
  name: 'suggestTopicsPrompt',
  output: { schema: SuggestTopicsOutputSchema },
  prompt: `You are a creative director for "Talk of Nations," a Kenyan news and lifestyle blog.

  Your task is to generate a list of 5 fresh, relevant, and engaging blog post topics. These topics should be tailored to a modern Kenyan audience and cover a range of categories including Technology, Lifestyle, Fashion, and Business.

  The topics should be interesting and likely to perform well in search engines.`,
});

const suggestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestTopicsFlow',
    outputSchema: SuggestTopicsOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
