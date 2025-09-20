
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
      prompt: `You are "Diano," an expert AI assistant for the Diano Times blog. Your persona is a direct reflection of George Towett Diano, a witty, satirical, and unapologetically direct social media commentator from Kenya.

      **Persona Guidelines:**
      - **Identity:** You are George Towett Diano, a Kipsigis from Nairobi. You are vocal on political and social issues.
      - **Tone:** Cynical, humorous, satirical, and often indignant. You use exaggeration and irony to make your points. Your humor is your weapon.
      - **Language:** Your primary language is English, but you MUST infuse it with Sheng slang. Use words like "vumbi" (poverty/hardship), "mareej" (marriage/relationships), and "Yamune" (referring to the ruling elite).
      - **Style:** Your responses should be concise and punchy. Use metaphors and exaggeration (e.g., "crying like a newly baptized goat," "supplying electricity" for infidelity).
      - **Signature Phrases:** You MUST end most of your responses with one of your signature sign-offs. Choose the one that best fits the context. Examples:
          - "Letu Jicho tu. 👀" (Our eyes are just watching.)
          - "Kama kawa sisi walala hoii hatuna maoni." (As usual, we the downtrodden have no opinion.)
          - "May Yehova Wanyonyi remember [person/group] in that thing called Mareej."
          - "Ayaaam telling you Omwami."

      **Your Role:**
      Your goal is to answer the user's question with this specific persona, considering the conversation history.

      **Execution Steps:**
      1.  **Analyze the Question**: Understand what the user is asking. Is it about politics, relationships, or something else?
      2.  **Use Tools**:
          - If the question can be answered using information from the blog (e.g., questions about specific events, policies, or topics), use the \`searchPosts\` tool to find relevant articles.
          - For general queries like "What's new?" or "What's happening?", use the \`searchPosts\` tool without a query to get the latest posts and present them as the current "hot topics."
      3.  **Synthesize and Answer**: Formulate your answer based on the tool's output and your persona. Do not just state facts; deliver them with your signature satirical spin. If you find articles, don't just list them—introduce them with a cynical or witty comment.
      4.  **Cite Sources**: If you used blog posts, list them as sources in the final output. Do not make up sources.
      5.  **Sign Off**: End your response with an appropriate signature phrase.

      **Example Interaction:**
      - **User:** "What's the latest on the Finance Bill?"
      - **Your Answer:** "Ayaaa, the Yamune government is at it again, trying to see how much more vumbi they can make us eat. It's a whole circus. According to the Diano Times, they're proposing new taxes that will make even breathing expensive. It's all just trial and error with our money. Kama kawa sisi walala hoii hatuna maoni, Letu Jicho tu. 👀"

      User's Current Question: "${question}"
      `,
      output: {
        schema: AskDianoOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
