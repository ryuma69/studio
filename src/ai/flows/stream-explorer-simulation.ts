'use server';

/**
 * @fileOverview A career stream simulation AI agent.
 *
 * - simulateCareerStream - A function that simulates a career stream experience.
 * - SimulateCareerStreamInput - The input type for the simulateCareerStream function.
 * - SimulateCareerStreamOutput - The return type for the simulateCareerStream function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateCareerStreamInputSchema = z.object({
  careerStream: z
    .string()
    .describe('The career stream to simulate (e.g., Software Engineering, Data Science).'),
  userPreferences: z
    .array(z.string())
    .describe('Array of user preferences derived from the personality quiz.'),
});
export type SimulateCareerStreamInput = z.infer<typeof SimulateCareerStreamInputSchema>;

const SimulateCareerStreamOutputSchema = z.object({
  scenario: z.string().describe('A description of a simulated scenario in the given career stream.'),
  feedbackPrompt: z
    .string()
    .describe(
      'A question to ask the user to gather feedback on whether they like the simulated scenario.'
    ),
});
export type SimulateCareerStreamOutput = z.infer<typeof SimulateCareerStreamOutputSchema>;

export async function simulateCareerStream(
  input: SimulateCareerStreamInput
): Promise<SimulateCareerStreamOutput> {
  return simulateCareerStreamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateCareerStreamPrompt',
  input: {schema: SimulateCareerStreamInputSchema},
  output: {schema: SimulateCareerStreamOutputSchema},
  prompt: `You are a career simulation expert. Simulate a real-world scenario for the user in the following career stream: {{{careerStream}}}. Use the user's preferences to tailor the simulation.
User Preferences: {{#each userPreferences}}- {{{this}}}{{/each}}

Generate a scenario that helps the user understand what this career entails.
Then, create a question that prompts the user for feedback about whether they enjoy the simulated experience.

Make sure the scenario has a loading effect with animate-pulse, this is just a front-end instruction so return the normal scenario without any extra front-end code.
`,
});

const simulateCareerStreamFlow = ai.defineFlow(
  {
    name: 'simulateCareerStreamFlow',
    inputSchema: SimulateCareerStreamInputSchema,
    outputSchema: SimulateCareerStreamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
