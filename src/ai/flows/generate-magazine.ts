
'use server';
/**
 * @fileOverview Generates a weekly magazine from recent blog posts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getPosts} from '@/lib/posts';
import {format} from 'date-fns';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

const GenerateMagazineInputSchema = z.object({
  postIds: z.array(z.string()).describe('An array of post IDs to include in the magazine.'),
});
export type GenerateMagazineInput = z.infer<typeof GenerateMagazineInputSchema>;

const MagazineSectionSchema = z.object({
    title: z.string().describe("The title of this magazine section."),
    summary: z.string().describe("An engaging, long-form summary of the articles in this section, written in a journalistic, magazine-style tone. It should be at least two paragraphs long."),
    articles: z.array(z.object({
        id: z.string().describe("The original post ID."),
        title: z.string().describe("The original post title."),
        slug: z.string().describe("The original post slug."),
        coverImage: z.string().url().describe("The URL of the cover image for the article."),
    })).describe("A list of articles included in this section."),
});

const SudokuSchema = z.object({
    puzzle: z.array(z.array(z.number())).describe("A 9x9 array representing the Sudoku puzzle, with 0 for empty cells."),
    solution: z.array(z.array(z.number())).describe("A 9x9 array representing the solved Sudoku puzzle."),
});

const GenerateMagazineOutputSchema = z.object({
  title: z.string().describe('A catchy title for the magazine, e.g., "Diano Weekly: The Future is Now".'),
  introduction: z.string().describe("A brief, welcoming introduction for the magazine's front page, at least two paragraphs long."),
  sections: z.array(MagazineSectionSchema).describe("An array of sections that categorize the week's content."),
  highlights: z.array(z.string()).describe("A bulleted list of 3-4 must-read article titles from the selection."),
  sudoku: SudokuSchema.describe("A Sudoku puzzle for the magazine's activity section."),
});
export type GenerateMagazineOutput = z.infer<typeof GenerateMagazineOutputSchema>;


export async function generateMagazine(input: {postIds: string[]}): Promise<GenerateMagazineOutput> {
  if (!(await isAiFeatureEnabled('isMagazineGenerationEnabled'))) {
    throw new Error('AI-powered magazine generation is disabled by the administrator.');
  }

  const posts = await getPosts({ids: input.postIds});

  if (posts.length === 0) {
    throw new Error('No posts found for the given IDs.');
  }

  const postsForPrompt = posts.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content.substring(0, 500), // Provide a snippet to the AI
    tags: p.tags,
    coverImage: p.coverImage,
  }));

  return generateMagazineFlow({posts: postsForPrompt});
}


const generateMagazineFlow = ai.defineFlow(
  {
    name: 'generateMagazineFlow',
    inputSchema: z.object({
      posts: z.array(z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        tags: z.array(z.string()),
        coverImage: z.string(),
      }))
    }),
    outputSchema: GenerateMagazineOutputSchema,
  },
  async ({posts}) => {
    const today = format(new Date(), 'MMMM d, yyyy');

    const prompt = `You are the editor-in-chief of "Diano Weekly", a digital magazine by Talk of Nations.
    Your task is to curate a comprehensive and engaging weekly magazine issue for the week of ${today}.
    You will be given a list of recent articles. Your job is to organize them into a coherent magazine format.

    Instructions:
    1.  **Title**: Create a catchy, impressive title for this issue.
    2.  **Introduction**: Write a compelling, long-form introduction (at least 2 paragraphs) that grabs the reader's attention and gives a taste of what's inside.
    3.  **Sections**: Group the articles into logical sections based on their tags (e.g., "Tech Corner", "Lifestyle & Culture", "Business & Finance", "Top Stories"). For each section:
        -   Write a detailed, engaging summary (at least 2 paragraphs) that introduces the articles and themes in that section.
        -   List the articles with their original IDs, titles, slugs, and coverImage URLs.
    4.  **Highlights**: Create a bulleted list of 3-4 "must-read" articles from the provided list.
    5.  **Sudoku Puzzle**: Create a new, unique Sudoku puzzle for the entertainment section. Provide both the unsolved puzzle grid and the complete solution grid. The puzzle should be of medium difficulty.

    Here are the articles for this week:
    ${JSON.stringify(posts, null, 2)}
    `;

    const {output} = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.5-flash',
      output: {
        schema: GenerateMagazineOutputSchema,
      },
      config: {
        temperature: 0.7,
      }
    });

    return output!;
  }
);
