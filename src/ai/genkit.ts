
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit configuration for DukaanSaathi AI.
 * Uses Google AI (Gemini) as the primary provider.
 * Ensure GOOGLE_GENAI_API_KEY is set in your environment variables.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
