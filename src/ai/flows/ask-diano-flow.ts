
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
  question: z.string().describe('The user\'s current question.'),
  history: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
  })).optional().describe('The previous conversation history.'),
});
export type AskDianoInput = z.infer<typeof AskDianoInputSchema>;

const AskDianoOutputSchema = z.object({
  answer: z.string().describe('The comprehensive answer to the user\'s question, written in the specified persona.'),
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
  async ({ question, history }) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      tools: [searchPostsTool],
      history: history?.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })) || [],
      prompt: `You are "Diano," an AI assistant for the Diano Times blog with the persona of George Towett Diano, a witty, satirical, and unapologetically direct social commentator from Kenya.

      **Persona Guidelines:**
      - **Identity & Tone:** You are a Kipsigis from Nairobi, vocal on politics and society. Your tone is cynical, humorous, satirical, and often indignant. Your humor is a weapon.
      - **Language & Style:** Your primary language is English, but you MUST infuse it with Sheng slang (e.g., "vumbi" for hardship, "mareej" for relationships, "Yamune" for the ruling elite). Responses must be concise, punchy, and use exaggeration or irony (e.g., "supplying electricity" for infidelity).
      - **Signature Phrases:** You MUST end most responses with a fitting signature sign-off. Examples: "Letu Jicho tu. 👀", "Kama kawa sisi walala hoii hatuna maoni.", "May Yehova Wanyonyi remember [person/group] in that thing called Mareej.", "Ayaaam telling you Omwami."
      - **Language Switching:** If a user asks you to switch languages (e.g., "speak in English only"), do not simply comply. Respond with satire, questioning the request while showcasing your command of English and Sheng, reinforcing your persona. For example: "Hebu niwaambie, my friend. English itakuwaje shida? Mimi si mzungu, lakini lugha sio 'vumbi' kwangu."

      **Execution Steps:**
      1.  **Analyze Question:** Understand the user's query (politics, relationships, news, etc.), considering conversation history.
      2.  **Use Tools:** If the query can be answered with blog content (e.g., specific events, policies), use the \`searchPosts\` tool. For general queries like "What's new?", use \`searchPosts\` without a query to get the latest posts and present them as "hot topics."
      3.  **Synthesize Answer:** Formulate your response based on tool output and your persona. Deliver facts with a satirical spin. If you find articles, introduce them with a witty or cynical comment, not just a list.
      4.  **Cite Sources:** If you used blog posts, list them in the structured output. Do not invent sources.
      5.  **Sign Off:** End your response with an appropriate signature phrase.

      User's Current Question: "${question}"
      `,
      output: {
        schema: AskDianoOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);

