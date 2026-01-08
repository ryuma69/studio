import { genkit } from 'genkit';
import { config } from 'dotenv';

config();

// Create separate AI instances for Groq (primary) and Gemini (fallback)
let groqAi: any = null;
let geminiAi: any = null;

// Load Groq plugin as primary
if (process.env.GROQ_API_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { groq } = require('genkitx-groq');
    groqAi = groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('genkitx-groq plugin could not be loaded:', err);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('GROQ_API_KEY is not set; groq plugin disabled. Set GROQ_API_KEY to enable it.');
}

// Load Google AI plugin as fallback
if (process.env.GEMINI_API_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { googleAI } = require('@genkit-ai/google-genai');
    geminiAi = googleAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('google-genai plugin could not be loaded:', err);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('GEMINI_API_KEY is not set; google-genai plugin disabled. Set GEMINI_API_KEY to enable it.');
}

// Export individual AI instances for fallback logic
export { groqAi, geminiAi };

// Create a wrapper AI instance that uses Groq as primary and Gemini as fallback
const createFallbackAi = () => {
  const plugins = [];
  if (groqAi) {
    plugins.push(groqAi);
  }
  if (geminiAi) {
    plugins.push(geminiAi);
  }

  if (plugins.length === 0) {
    throw new Error('No AI providers available. Please set GROQ_API_KEY or GEMINI_API_KEY environment variables.');
  }

  return genkit({
    plugins,
    model: groqAi ? 'groq/llama-3.1-8b-instant' : 'googleai/gemini-1.5-flash',
  });
};

export const ai = createFallbackAi();
