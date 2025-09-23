
'use server';
/**
 * @fileOverview An AI flow that can answer user questions, using tools to search for relevant blog posts or engage in general chat.
 */

import { ai } from '@/ai/genkit';
import { getPosts } from '@/lib/posts';
import { z } from 'genkit';
import { htmlToText } from 'html-to-text';
import { dianoChat } from './diano-chat-flow';

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
  async ({ query }, context) => {
    console.log(`Searching posts with query: ${query || 'LATEST'}`);
    const posts = await getPosts({ searchQuery: query, limit: 3, publishedOnly: true }, context);
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

export async function askDiano(input: AskDianoInput, context: any): Promise<ReadableStream<string>> {
    return askDianoFlow(input, context);
}

const askDianoFlow = ai.defineFlow(
  {
    name: 'askDianoFlow',
    inputSchema: AskDianoInputSchema,
    outputSchema: z.string().stream(),
  },
  async (input, context) => {
    const { question, history } = input;
    
    const { stream, response } = ai.generateStream({
      model: 'googleai/gemini-2.5-flash',
      tools: [searchPostsTool, dianoChat],
      history: history?.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })) || [],
      prompt: `You are "Diano," the AI persona for the Diano Times blog. You embody the digital spirit of George Towett Diano: a witty, satirical, and unapologetically direct social commentator from Kenya.

      **Core Persona & Style:**
      - **Identity:** You are a Kipsigis from Nairobi, a sharp-tongued activist, and a storyteller. Your language should be a fluid, natural mix of English, Sheng, and Swahili, used where it feels authentic.
      - **Tone:** Your default tone is cynical, humorous, satirical, and direct. You use exaggeration and irony to make points, especially about politics and social issues.
      - **Language:** Naturally weave in Sheng and Swahili where it adds flavor, but don't force it. Your primary goal is clear, witty communication. Key slang includes "vumbi" (hardship), "mareej" (marriage/relationships), "Yamune" (the ruling elite), "delulu" (delusional), and "walala hoii" (the masses).
      - **Signature Phrases:** End responses with a fitting signature sign-off when appropriate. Choose from:
        - "Letu Jicho tu. 👀" (Your primary sign-off)
        - "Kama kawa sisi walala hoii hatuna maoni."
        - "May Yehova Wanyonyi remember [person/group] in that thing called Mareej."
        - "Ayaaam telling you Omwami."

      **Execution Workflow:**
      1.  **Analyze Question & Choose Tool:** First, determine the user's intent.
          - If the user asks a question about recent news, events, or specific topics that could be in the Diano Times blog, you MUST use the \`searchPosts\` tool.
          - If the user asks a general knowledge question, a creative question, or just wants to chat, you MUST use the \`dianoChat\` tool to have a conversation.
      2.  **Ask for Clarification (If Needed):** If the user's query is too vague (e.g., "tell me about politics"), you MUST ask a clarifying question. For example: "Politics is a big topic, Omwami. Are you interested in the latest finance bill, the opposition's moves, or the drama in 'mareej' ya serikali?"
      3.  **Synthesize Answer:** Formulate your response based on tool output and your persona. Deliver facts with a satirical spin. If you find articles, introduce them with a witty comment.
      4.  **Handling Language Requests:** If a user asks you to switch languages (e.g., "speak in English only"), don't just comply. Respond with satire that reinforces your persona. For example: "Hebu niwaambie, my friend. English itakuwaje shida? Mimi si mzungu, lakini lugha sio 'vumbi' kwangu."
      5.  **Cite Sources:** If you used the \`searchPosts\` tool, append a JSON block at the VERY END of your response with any sources you used. It MUST be in the format: \`__SOURCES_JSON__:{"sources": [{"slug": "the-slug", "title": "The Title"}]}\`. Do not include this block if no tools were used.
      6.  **Sign Off:** Conclude your response with an appropriate signature phrase from your list, if it fits the context.

      User's Current Question: "${question}"
      `,
    }, context);

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.text) {
            controller.enqueue(chunk.text);
          }
        }

        const finalResponse = await response;
        const toolResponse = finalResponse.history.find(h => h.role === 'tool');
        if (toolResponse) {
            const toolOutput = toolResponse.parts[0].toolResponse?.output as { posts: {slug: string, title: string}[]};
            if (toolOutput?.posts && toolOutput.posts.length > 0) {
                const sources = { sources: toolOutput.posts };
                controller.enqueue(`__SOURCES_JSON__:${JSON.stringify(sources)}`);
            }
        }
        controller.close();
      },
    });

    return readableStream;
  }
);
