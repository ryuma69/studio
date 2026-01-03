// src/ai/ai-career-analysis.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing a 10th grade student's quiz answers and recommending an academic stream.
 *
 * - analyzeAptitude - A function that takes quiz answers and returns a stream recommendation.
 * - AnalyzeAptitudeInput - The input type for the analyzeAptitude function.
 * - AnalyzeAptitudeOutput - The return type for the analyzeAptitude function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAptitudeInputSchema = z.object({
  answers: z.array(z.string()).describe('An array of strings representing the user’s answers to the personality quiz.'),
  timeTaken: z.number().describe('The time taken to complete the quiz, in seconds.'),
});
export type AnalyzeAptitudeInput = z.infer<typeof AnalyzeAptitudeInputSchema>;

const AnalyzeAptitudeOutputSchema = z.object({
  careerRecommendation: z.string().describe('A personalized recommendation for which academic stream (Science, Commerce, Arts) to choose after 10th grade.'),
  careerStreams: z.array(z.string()).describe('An array of 2-3 specific career examples within the recommended stream.'),
});
export type AnalyzeAptitudeOutput = z.infer<typeof AnalyzeAptitudeOutputSchema>;

export type AptitudeAnalysis = { recommendation: string; careerStreams: string[] };

export async function analyzeAptitude(input: AnalyzeAptitudeInput): Promise<AptitudeAnalysis> {
  const output = await analyzeAptitudeFlow(input);
  return {
    recommendation: output.careerRecommendation,
    careerStreams: output.careerStreams,
  };
}

const analyzeAptitudePrompt = ai.definePrompt({
  name: 'analyzeAptitudePrompt',
  input: {schema: AnalyzeAptitudeInputSchema},
  output: {schema: AnalyzeAptitudeOutputSchema},
  prompt: `You are an expert student counselor for 10th-grade students in India.
Analyze the student's quiz answers to recommend a primary academic stream (Science, Commerce, or Arts) for their 11th and 12th grade.

Quiz Answers: {{{answers}}}

Based on this information, provide a JSON object with:
- careerRecommendation: A personalized paragraph explaining which stream fits them best and why.
- careerStreams: An array of 2-3 specific career examples that a student can pursue from that stream (e.g., for Science: Software Engineering, Doctor).

Ensure the recommendations are encouraging and suitable for a 10th-grade student.
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
