'use server';

/**
 * @fileOverview Generates a detailed report explaining the suitability and future worth of a career stream.
 *
 * - generateDetailedReport - A function that generates the detailed report.
 * - DetailedReportInput - The input type for the generateDetailedReport function.
 * - DetailedReportOutput - The return type for the generateDetailedReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetailedReportInputSchema = z.object({
  careerStream: z.string().describe('The name of the career stream.'),
  userFeedback: z.string().describe('The user feedback on the career stream.'),
  quizAnswers: z.array(z.string()).describe('The answers from the personality quiz.'),
});
export type DetailedReportInput = z.infer<typeof DetailedReportInputSchema>;

const DetailedReportOutputSchema = z.object({
  report: z.string().describe('A detailed report explaining the suitability and future worth of the career stream.'),
});
export type DetailedReportOutput = z.infer<typeof DetailedReportOutputSchema>;

export async function generateDetailedReport(input: DetailedReportInput): Promise<DetailedReportOutput> {
  return detailedReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detailedReportPrompt',
  input: {schema: DetailedReportInputSchema},
  output: {schema: DetailedReportOutputSchema},
  prompt: `You are an expert career counselor, skilled at explaining the suitability and future worth of career streams to parents.

  Based on the user's quiz answers: {{{quizAnswers}}} and their feedback on the career stream: {{{userFeedback}}}.

  Generate a detailed report for the career stream: {{{careerStream}}} explaining why it suits the user and its worth in the future. Include potential future earnings, job satisfaction rates, and in-demand skills for the next 10 years, to address any parental concerns. Consider their quiz answers to provide the best possible analysis.
  `,
});

const detailedReportFlow = ai.defineFlow(
  {
    name: 'detailedReportFlow',
    inputSchema: DetailedReportInputSchema,
    outputSchema: DetailedReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
