'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Safe for build-time: Null checks added for 'ai' instance
const DetailedReportInputSchema = z.object({
  careerStream: z.string().describe('The name of the career stream.'),
  userFeedback: z.string().describe('The user feedback on the career stream.'),
  quizAnswers: z.array(z.string()).describe('The answers from the personality quiz.'),
});

export type DetailedReportInput = z.infer<typeof DetailedReportInputSchema>;

const DetailedReportOutputSchema = z.object({
  strengths: z.string().describe("The user's strengths based on the quiz."),
  suitability: z.string().describe('Why the career stream is a good fit.'),
  jobProspects: z.array(z.string()).describe('Sample job titles.'),
  aptitudeScores: z.array(z.object({
    name: z.string().describe("Name of the aptitude area (e.g., 'Logical', 'Creative', 'Verbal')"),
    score: z.number().describe("Score out of 100 for this area.")
  })).describe("A breakdown of the user's aptitude scores.")
});

export type DetailedReportOutput = z.infer<typeof DetailedReportOutputSchema>;

const MOCK_DETAILED_REPORT: DetailedReportOutput = {
  strengths: "You exhibit strong analytical reasoning and a keen eye for detail. You approach problems methodically and enjoy structured environments.",
  suitability: "This stream matches your profile perfectly as it requires logic, precision, and the ability to work with complex systems.",
  jobProspects: ["Software Developer", "Data Analyst", "Technical Manager"],
  aptitudeScores: [
    { name: "Logical", score: 85 },
    { name: "Verbal", score: 65 },
    { name: "Creative", score: 70 },
    { name: "Spatial", score: 80 }
  ]
};

<<<<<<< HEAD
const prompt = ai!.definePrompt({
=======
const prompt = ai ? ai.definePrompt({
>>>>>>> d4e3f69bc80057d8d1a3fd533acdfbcc2cfcc108
  name: 'detailedReportPrompt',
  input: { schema: DetailedReportInputSchema },
  output: { schema: DetailedReportOutputSchema },
  prompt: `You are a career counselor providing a JSON output for a 10th-grade student's career report.

The student is interested in the '{{{careerStream}}}' stream.
Their quiz answers were: {{{quizAnswers}}}.
The quiz covers logical reasoning, spatial awareness, verbal skills, and creativity.
Their feedback on a simulation was: {{{userFeedback}}}.

Based on this, provide the following information in JSON format:
- strengths: Based on the quiz, what is the child naturally good at? (e.g., "Logical thinker who enjoys solving problems.")
- suitability: Explain in simple terms why the '{{{careerStream}}}' stream is a good fit for these strengths.
- jobProspects: List 3-4 sample job titles available in this stream in the future (e.g., ["Software Developer", "Data Analyst"]).
- aptitudeScores: Analyze the quiz answers and provide a score out of 100 for each of the following aptitudes: 'Logical', 'Spatial', 'Verbal', and 'Creative'. The scores should be represented as an array of objects, e.g., [{ "name": "Logical", "score": 85 }, ...].
`,
}) : null;

<<<<<<< HEAD
const detailedReportFlow = ai!.defineFlow(
=======
const detailedReportFlow = ai ? ai.defineFlow(
>>>>>>> d4e3f69bc80057d8d1a3fd533acdfbcc2cfcc108
  {
    name: 'detailedReportFlow',
    inputSchema: DetailedReportInputSchema,
    outputSchema: DetailedReportOutputSchema,
  },
  async input => {
    if (!prompt) throw new Error("Prompt not defined");
    const { output } = await prompt(input);
    return output!;
  }
) : null;

export async function generateDetailedReport(input: DetailedReportInput): Promise<DetailedReportOutput> {
  if (!detailedReportFlow) {
    console.log("Mock Mode: Returning detailed report mock.");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_DETAILED_REPORT;
  }
  return detailedReportFlow(input);
}
