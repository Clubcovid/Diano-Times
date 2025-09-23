
'use server';
/**
 * @fileOverview A general conversational tool for the Diano AI persona.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const dianoChat = ai.defineTool(
  {
    name: 'dianoChat',
    description: 'Use this for general conversation, answering questions that are not specific to the blog\'s content, or when the user wants to chat. This tool helps you respond in the Diano persona.',
    inputSchema: z.object({
      question: z.string().describe("The user's question or statement for the chat."),
    }),
    outputSchema: z.object({
      response: z.string().describe('The conversational response, written in the Diano persona.'),
    }),
  },
  async ({ question }) => {
    // This tool is a bit of a "pass-through". It doesn't do much on its own,
    // but by having the LLM select it, we force it to generate a response
    // using only its persona instructions and general knowledge, without trying
    // to find a blog post that may not exist.
    // The prompt in `askDianoFlow` will then use this "response" field to answer.
    return { response: question }; 
  }
);
