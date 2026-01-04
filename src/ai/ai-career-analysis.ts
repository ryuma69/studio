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

const QuestionAnswerSchema = z.object({
  id: z.string().describe('Question id.'),
  question: z.string().describe('Question text.'),
  answer: z.string().describe('Selected answer text.'),
});

const AnalyzeAptitudeInputSchema = z.object({
  answers: z.array(QuestionAnswerSchema).describe('An array of objects representing the quiz questions and selected answers.'),
  timeTaken: z.number().describe('The time taken to complete the quiz, in seconds.'),
});
export type AnalyzeAptitudeInput = z.infer<typeof AnalyzeAptitudeInputSchema>;

const AnalyzeAptitudeOutputSchema = z.object({
  careerRecommendation: z.string().describe('A personalized recommendation for which academic stream (Science, Commerce, Arts) to choose after 10th grade.'),
  careerStreams: z.array(z.string()).describe('An array of 2-3 specific career examples within the recommended stream.'),
});
export type AnalyzeAptitudeOutput = z.infer<typeof AnalyzeAptitudeOutputSchema>;

export async function analyzeAptitude(input: AnalyzeAptitudeInput): Promise<AnalyzeAptitudeOutput> {
  try {
    return await analyzeAptitudeFlow(input);
  } catch (err) {
    // Log full error server-side for debugging
    // eslint-disable-next-line no-console
    console.error('analyzeAptitude server action failed:', err);
    // Provide a friendly, non-sensitive error to the client
    throw new Error('Server error while analyzing aptitude. Check server logs for details.');
  }
}

const analyzeAptitudePrompt = ai.definePrompt({
  name: 'analyzeAptitudePrompt',
  input: {schema: AnalyzeAptitudeInputSchema},
  output: {schema: AnalyzeAptitudeOutputSchema},
  prompt: `You are an expert student counselor for 10th-grade students in India.
Analyze the student's quiz responses to recommend a primary academic stream (Science, Commerce, or Arts) for their 11th and 12th grade.

Quiz Responses:
{{#each answers}}
- ID: {{{this.id}}}
  Question: {{{this.question}}}
  Answer: {{{this.answer}}}
{{/each}}

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
    try {
      const {output} = await analyzeAptitudePrompt(input);
      return output!;
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (/Model.*not found|NOT_FOUND|not found/i.test(msg)) {
        const model = process.env.GENKIT_MODEL || '<unset>';
        throw new Error(
          `AI model error: Model '${model}' not found. Set a valid model name in the GENKIT_MODEL environment variable (for example 'googleai/gemini-1.0'), or verify the model availability with your provider. Original error: ${msg}`
        );
      }
      throw err;
    }
  }
);
