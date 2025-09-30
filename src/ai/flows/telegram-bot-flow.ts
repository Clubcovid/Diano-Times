
'use server';
/**
 * @fileOverview An AI flow to handle interactive conversations from a Telegram bot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { askDiano } from './ask-diano-flow';

const TelegramBotInputSchema = z.object({
  chatId: z.number().describe('The ID of the Telegram chat.'),
  message: z.string().describe("The user's message from Telegram."),
});
export type TelegramBotInput = z.infer<typeof TelegramBotInputSchema>;

const TelegramBotOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to be sent back to the user.'),
});
export type TelegramBotOutput = z.infer<typeof TelegramBotOutputSchema>;


export const telegramBotFlow = ai.defineFlow(
  {
    name: 'telegramBotFlow',
    inputSchema: TelegramBotInputSchema,
    outputSchema: TelegramBotOutputSchema,
  },
  async ({ chatId, message }) => {
    
    // For now, this just proxies the message to the Ask Diano flow.
    // In the future, we could add more complex logic here, like checking
    // a user's chat history from a database.
    const dianoResponse = await askDiano({
        question: message,
        history: [], // No history for now
    }, { headers: new Headers() }); // Mock headers for now

    return {
      response: dianoResponse.answer,
    };
  }
);
