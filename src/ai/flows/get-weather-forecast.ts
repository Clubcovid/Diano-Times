'use server';
/**
 * @fileOverview A weather forecasting AI agent.
 *
 * - getWeatherForecast - A function that handles fetching the weather forecast.
 * - GetWeatherForecastInput - The input type for the getWeatherForecast function.
 * - WeatherForecast - The return type for the getWeatherForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeatherForecastInputSchema = z.object({
  location: z.string().describe('The city and country for which to get the weather forecast, e.g., "Nairobi, Kenya".'),
});
export type GetWeatherForecastInput = z.infer<typeof GetWeatherForecastInputSchema>;

const WeatherForecastSchema = z.object({
  location: z.string().describe("The location of the forecast."),
  temperature: z.string().describe('The current temperature in Celsius.'),
  condition: z.string().describe('A brief description of the weather condition (e.g., "Sunny", "Partly Cloudy").'),
  icon: z.string().describe('The name of a lucide-react icon that best represents the weather condition (e.g., "Sun", "Cloudy", "CloudRain").'),
});
export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;

export async function getWeatherForecast(input: GetWeatherForecastInput): Promise<WeatherForecast> {
  return getWeatherForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWeatherForecastPrompt',
  input: {schema: GetWeatherForecastInputSchema},
  output: {schema: WeatherForecastSchema},
  prompt: `You are a weather forecasting expert. Provide a concise and accurate weather forecast for the following location: {{{location}}}.

  Return the current temperature in Celsius, a brief weather condition, and a single, relevant lucide-react icon name (like Sun, Cloudy, CloudRain, CloudSnow, CloudLightning, Wind).
  
  For the location, return the city name you used for the forecast.`,
});

const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: WeatherForecastSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
