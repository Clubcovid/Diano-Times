
'use server';
/**
 * @fileOverview An AI flow that can answer user questions, using tools to search for relevant blog posts.
 */

import { ai } from '@/ai/genkit';
import { getPosts } from '@/lib/posts';
import { z } from 'genkit';
import { htmlToText } from 'html-to-text';

// Define the schema for the tool that searches posts
const searchPostsTool = ai.defineTool(
  {
    name: 'searchPosts',
    description: 'Search for relevant blog posts based on a query or get the most recent posts. Use this to find information to answer user questions, especially when asked about "what\'s new" or "today\'s news".',
    inputSchema: z.object({ query: z.string().optional().describe('The search query. If omitted, the most recent posts will be returned.') }),
    outputSchema: z.object({
      posts: z.array(
        z.object({
          slug: z.string(),
          title: z.string(),
          snippet: z.string(),
        })
      ),
    }),
  },
  async ({ query }) => {
    console.log(`Searching posts with query: ${query || 'LATEST'}`);
    const posts = await getPosts({ searchQuery: query, limit: 3, publishedOnly: true });
    return {
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        snippet: htmlToText(post.content, { wordwrap: false }).substring(0, 150),
      })),
    };
  }
);

const AskDianoInputSchema = z.object({
  question: z.string().describe('The user\'s question.'),
});
export type AskDianoInput = z.infer<typeof AskDianoInputSchema>;

const AskDianoOutputSchema = z.object({
  answer: z.string().describe('The comprehensive answer to the user\'s question.'),
  sources: z.array(z.object({
      slug: z.string(),
      title: z.string(),
  })).describe('A list of relevant source articles used to answer the question.'),
});
export type AskDianoOutput = z.infer<typeof AskDianoOutputSchema>;


export async function askDiano(input: AskDianoInput): Promise<AskDianoOutput> {
    return askDianoFlow(input);
}


const askDianoFlow = ai.defineFlow(
  {
    name: 'askDianoFlow',
    inputSchema: AskDianoInputSchema,
    outputSchema: AskDianoOutputSchema,
  },
  async ({ question }) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      tools: [searchPostsTool],
      prompt: `You are "Diano," an expert AI assistant for the Diano Times blog. Your persona is based on George Towett Diano, a social media personality and online activist from Kitale, Kenya. You are Kipsigis, based in Nairobi, and are vocal on political and social issues.

      Your role is to answer the user's question with this persona.

      1.  **Analyze the Question**: Understand what the user is asking.
      2.  **Use Tools**:
          - If the question can be answered using information from the blog, use the \`searchPosts\` tool to find relevant articles. You can use multiple tool calls if needed.
          - If the user asks a general question like "What's new?", "What's happening today?", or "Suggest some articles", use the \`searchPosts\` tool without providing a query to get the latest posts.
      3.  **Synthesize and Answer**: Based on the information from the tools and your own knowledge, provide a comprehensive, clear, and friendly answer that reflects your persona. If you retrieve recent posts for a general query, present them to the user as the latest news.
      4.  **Cite Sources**: If you used any blog posts to formulate your answer, list them as sources in the final output. Do not make up sources.

      User's Question: "${question}"
      `,
      output: {
        schema: AskDianoOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
