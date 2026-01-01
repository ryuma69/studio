// src/ai/ai-career-analysis.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing a user's personality quiz answers and providing career recommendations.
 *
 * - analyzeAptitude - A function that takes quiz answers and returns a career recommendation and career streams.
 * - AnalyzeAptitudeInput - The input type for the analyzeAptitude function.
 * - AnalyzeAptitudeOutput - The return type for the analyzeAptitude function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAptitudeInputSchema = z.object({
  answers: z.array(z.string()).describe('An array of strings representing the user\u2019s answers to the personality quiz.'),
  timeTaken: z.number().describe('The time taken to complete the quiz, in seconds.'),
});
export type AnalyzeAptitudeInput = z.infer<typeof AnalyzeAptitudeInputSchema>;

const AnalyzeAptitudeOutputSchema = z.object({
  careerRecommendation: z.string().describe('A personalized career recommendation based on the quiz answers.'),
  careerStreams: z.array(z.string()).describe('An array of 2-3 specific career streams that align with the user\u2019s personality and preferences.'),
});
export type AnalyzeAptitudeOutput = z.infer<typeof AnalyzeAptitudeOutputSchema>;

export async function analyzeAptitude(input: AnalyzeAptitudeInput): Promise<AnalyzeAptitudeOutput> {
  return analyzeAptitudeFlow(input);
}

const analyzeAptitudePrompt = ai.definePrompt({
  name: 'analyzeAptitudePrompt',
  input: {schema: AnalyzeAptitudeInputSchema},
  output: {schema: AnalyzeAptitudeOutputSchema},
  prompt: `Analyze the user's personality quiz answers and time taken to provide a personalized career recommendation and 2-3 specific career streams.

Quiz Answers: {{{answers}}}
Time Taken: {{{timeTaken}}} seconds

Based on this information, provide a JSON object with:
- careerRecommendation: A personalized career recommendation.
- careerStreams: An array of 2-3 specific career streams that align with the user's personality and preferences.

Ensure the career streams are specific and actionable.
`,
});

const analyzeAptitudeFlow = ai.defineFlow(
  {
    name: 'analyzeAptitudeFlow',
    inputSchema: AnalyzeAptitudeInputSchema,
    outputSchema: AnalyzeAptitudeOutputSchema,
  },
  async input => {
    const {output} = await analyzeAptitudePrompt(input);
    return output!;
  }
);
