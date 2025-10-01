
'use server';
/**
 * @fileOverview A weather forecasting AI agent that uses a dedicated tool to fetch live data.
 *
 * - getWeatherForecast - A function that handles fetching the weather forecast.
 * - GetWeatherForecastInput - The input type for the getWeatherForecast function.
 * - WeatherForecast - The return type for the getWeatherForecast function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { isAiFeatureEnabled } from '@/lib/ai-flags';

// Define the schema for the tool that calls the WeatherAPI.com
const fetchWeatherFromApiTool = ai.defineTool(
  {
    name: 'fetchWeatherFromApi',
    description: 'Fetches real-time weather data for a specified location from a reliable weather API.',
    inputSchema: z.object({
      location: z.string().describe('The city name for which to get the weather forecast, e.g., "Nairobi".'),
    }),
    outputSchema: z.object({
      location: z.string(),
      temperature_c: z.number(),
      condition_text: z.string(),
      condition_icon_code: z.number(),
    }),
  },
  async ({ location }) => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('Weather API key is not configured.');
    }
    
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.error) {
        throw new Error(`Weather API error: ${data.error.message}`);
    }
    
    return {
      location: data.location.name,
      temperature_c: data.current.temp_c,
      condition_text: data.current.condition.text,
      condition_icon_code: data.current.condition.code,
    };
  }
);

// Map weather condition codes from the API to lucide-react icons
function mapCodeToIcon(code: number): string {
    // A simplified mapping based on WeatherAPI.com condition codes
    if ([1000].includes(code)) return 'Sun';
    if ([1003].includes(code)) return 'Cloudy';
    if ([1006, 1009, 1030].includes(code)) return 'Cloud';
    if ([1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) return 'CloudRain';
    if ([1273, 1276, 1087].includes(code)) return 'CloudLightning';
    if ([1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return 'CloudSnow';
    if (code >= 1150 && code <= 1171) return 'CloudDrizzle'; // Drizzle/light rain
    return 'Cloud'; // Default icon
}


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
  if (!(await isAiFeatureEnabled('isWeatherForecastEnabled'))) {
    throw new Error('AI-powered weather forecast is disabled by the administrator.');
  }
  return getWeatherForecastFlow(input);
}


const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: GetWeatherForecastInputSchema,
    outputSchema: WeatherForecastSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      tools: [fetchWeatherFromApiTool],
      prompt: `Get the current weather for ${input.location}. Then, format the output to match the required schema. Use the provided mapping to convert the weather condition code to a lucide-react icon name.`,
      output: {
        schema: z.object({
            location: z.string(),
            temperature: z.number(),
            condition: z.string(),
            iconCode: z.number(),
        })
      },
    });

    const result = llmResponse.output;
    if (!result) {
        throw new Error("Could not get a valid weather forecast from the AI.");
    }
    
    return {
        location: result.location,
        temperature: `${result.temperature}°C`,
        condition: result.condition,
        icon: mapCodeToIcon(result.iconCode),
    };
  }
);
