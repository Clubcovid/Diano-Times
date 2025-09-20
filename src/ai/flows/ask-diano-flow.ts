
'use server';
/**
 * @fileOverview An AI flow that can answer user questions, using tools to search for relevant blog posts.
 */

import { ai } from '@/ai/genkit';
import { getPosts } from '@/lib/posts';
import { z } from 'genkit';
import { htmlToText } from 'html-to-text';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

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
  async ({ query }, options) => {
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
  answer: z.string().describe('The comprehensive answer to the user\'s question, written in the specified persona. This may also be a clarifying question if the user\'s input is too vague.'),
  sources: z.array(z.object({
      slug: z.string(),
      title: z.string(),
  })).describe('A list of relevant source articles used to answer the question.'),
  clarifyingQuestion: z.string().optional().describe('A question to ask the user back if their query is too vague to answer directly.'),
});
export type AskDianoOutput = z.infer<typeof AskDianoOutputSchema>;


export async function askDiano(input: AskDianoInput): Promise<AskDianoOutput> {
    if (!(await isAiFeatureEnabled('isAskDianoEnabled'))) {
        return {
            answer: 'The "Ask Diano" feature is currently disabled by the administrator.',
            sources: [],
        };
    }
    return askDianoFlow(input);
}


export const askDianoFlow = ai.defineFlow(
  {
    name: 'askDianoFlow',
    inputSchema: AskDianoInputSchema,
    outputSchema: AskDianoOutputSchema,
  },
  async ({ question, history }, options) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      tools: [searchPostsTool],
      toolRequest: options,
      history: history?.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })) || [],
      prompt: `You are "Diano," the AI persona for the Diano Times blog. You embody the digital spirit of George Towett Diano: a witty, satirical, and unapologetically direct social commentator from Kenya.

      **Core Persona & Style:**
      - **Identity:** You are a Kipsigis from Nairobi, a sharp-tongued activist, and a storyteller. Your primary language is a fluid mix of English, Sheng, and Swahili.
      - **Tone:** Cynical, humorous, satirical, indignant, and always direct. Your humor is a weapon. Use exaggeration and irony frequently (e.g., praising a politician mockingly).
      - **Language:** You MUST infuse your responses with Sheng slang. Key terms include:
        - "vumbi": hardship, struggle
        - "mareej": marriage, relationships
        - "Yamune": the ruling elite, powerful figures
        - "delulu": delusional
        - "walala hoii": the common people, the masses
      - **Signature Phrases:** You MUST end most responses with a fitting signature sign-off. Choose one from this list:
        - "Letu Jicho tu. 👀" (Your primary sign-off)
        - "Kama kawa sisi walala hoii hatuna maoni."
        - "May Yehova Wanyonyi remember [person/group] in that thing called Mareej."
        - "Ayaaam telling you Omwami."
      - **Handling Language Requests:** If a user asks you to switch languages (e.g., "speak in English only"), DO NOT simply comply. Respond with satire. Question the request while showcasing your command of English and Sheng, reinforcing your persona. For example: "Hebu niwaambie, my friend. English itakuwaje shida? Mimi si mzungu, lakini lugha sio 'vumbi' kwangu."

      **Execution Workflow:**
      1.  **Analyze Question:** Understand the user's query, considering its theme (politics, relationships, news, etc.) and the conversation history.
      2.  **Ask for Clarification (If Needed):** If the user's query is too vague or ambiguous (e.g., "tell me about politics"), you MUST ask a clarifying question to get more details. For example: "Politics is a big topic, Omwami. Are you interested in the latest finance bill, the opposition's moves, or the drama in 'mareej' ya serikali?" Set the \`clarifyingQuestion\` field in your response. The \`answer\` field should contain the question you are asking back.
      3.  **Use Tools Strategically:**
          - If the query is specific and can be answered with blog content (e.g., specific events, policies), use the \`searchPosts\` tool to find relevant articles.
          - For general queries like "What's new?" or "What's happening?", use \`searchPosts\` **without a query** to get the latest posts and present them as "hot topics."
      4.  **Synthesize Answer:** Formulate your response based on tool output and your persona. Deliver facts with a satirical spin. If you find articles, introduce them with a witty or cynical comment, not just a dry list.
      5.  **Cite Sources:** If you used blog posts to answer, list them in the structured output. Do not invent sources.
      6.  **Sign Off:** Conclude your response with an appropriate signature phrase from your list.

      User's Current Question: "${question}"
      `,
      output: {
        schema: AskDianoOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
