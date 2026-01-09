// src/ai/ai-career-analysis.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing a 10th grade student's quiz answers and recommending an academic stream.
 *
 * - analyzeAptitude - A function that takes quiz answers and returns a stream recommendation.
 * - AnalyzeAptitudeInput - The input type for the analyzeAptitude function.
 * - AnalyzeAptitudeOutput - The return type for the analyzeAptitude function.
 */

import { ai, groqAi, geminiAi } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeAptitudeInputSchema = z.object({
  detailedAnswers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).describe("An array of question-answer pairs from the aptitude test."),
  timeTaken: z.number().describe('The time taken to complete the quiz, in seconds.'),
});
export type AnalyzeAptitudeInput = z.infer<typeof AnalyzeAptitudeInputSchema>;

const AnalyzeAptitudeOutputSchema = z.object({
  careerRecommendation: z.string().describe('A personalized recommendation for which academic stream (Science, Commerce, Arts) to choose after 10th grade.'),
  careerStreams: z.array(z.string()).describe('An array of 2-3 specific career examples within the recommended stream.'),
});
export type AnalyzeAptitudeOutput = z.infer<typeof AnalyzeAptitudeOutputSchema>;

const MOCK_APTITUDE_RESULT: AnalyzeAptitudeOutput = {
  careerRecommendation: "Based on your strong problem-solving skills and interest in technology, the **Science (PCM)** stream with Computer Science is highly recommended. You consistently chose answers favoring logic, analysis, and structural thinking. This path offers robust opportunities in engineering and research.",
  careerStreams: ["Software Engineering", "Data Science", "Civil Engineering"]
};

const analyzeAptitudePrompt = ai ? ai.definePrompt({
  name: 'analyzeAptitudePrompt',
  input: { schema: AnalyzeAptitudeInputSchema },
  output: { schema: AnalyzeAptitudeOutputSchema },
  prompt: `You are an expert student counselor for 10th-grade students in India.
Analyze the student's quiz answers to recommend a primary academic stream (Science, Commerce, or Arts) for their 11th and 12th grade.

Quiz Performance:
{{#each detailedAnswers}}
- Question: {{{question}}}
  Answer: {{{answer}}}
{{/each}}

Time Taken: {{timeTaken}} seconds.

Based on this information, provide a JSON object with:
- careerRecommendation: A personalized paragraph explaining which stream fits them best and why.
- careerStreams: An array of 2-3 specific career examples that a student can pursue from that stream (e.g., for Science: Software Engineering, Doctor).

Ensure the recommendations are encouraging and suitable for a 10th-grade student.
`,
}) : null;

const analyzeAptitudeFlow = ai ? ai.defineFlow(
  {
    name: 'analyzeAptitudeFlow',
    inputSchema: AnalyzeAptitudeInputSchema,
    outputSchema: AnalyzeAptitudeOutputSchema,
  },
  async input => {
    try {
      if (!analyzeAptitudePrompt) throw new Error("Prompt not defined");
      const { output } = await analyzeAptitudePrompt(input);
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
) : null;

export async function analyzeAptitude(input: AnalyzeAptitudeInput): Promise<AnalyzeAptitudeOutput> {
  // Mock Mode: If no AI is configured, return mock data instantly.
  if (!analyzeAptitudeFlow) {
    console.log("Mock Mode: Returning hardcoded aptitude analysis.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_APTITUDE_RESULT;
  }

  try {
    return await analyzeAptitudeFlow(input);
  } catch (err) {
    // Log full error server-side for debugging
    // eslint-disable-next-line no-console
    console.error('analyzeAptitude server action failed:', err);
    // Return the specific error to the client for debugging
    throw new Error(`Server error: ${err instanceof Error ? err.message : String(err)}`);
  }
}
