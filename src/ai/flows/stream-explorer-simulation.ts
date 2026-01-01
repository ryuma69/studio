'use server';

/**
 * @fileOverview A career stream simulation AI agent that creates an interactive Q&A experience.
 *
 * - simulateCareerStream - A function that simulates a career stream experience.
 * - SimulateCareerStreamInput - The input type for the simulateCareerStream function.
 * - SimulateCareerStreamOutput - The return type for the simulateCareerStream function.
 * - ConversationTurn - Represents a turn in the conversation history.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>;

const SimulateCareerStreamInputSchema = z.object({
  careerStream: z.string().describe('The career stream to simulate (e.g., Software Engineering, Data Science).'),
  userPreferences: z.array(z.string()).describe('Array of user preferences derived from the personality quiz.'),
  conversationHistory: z.array(ConversationTurnSchema).optional().describe('The history of the conversation so far.'),
  userResponse: z.string().optional().describe('The user\'s latest response to a question.'),
});
export type SimulateCareerStreamInput = z.infer<typeof SimulateCareerStreamInputSchema>;

const SimulateCareerStreamOutputSchema = z.object({
  scenario: z.string().describe('A description of a simulated scenario or a question to the user.'),
  options: z.array(z.string()).optional().describe('An array of 2-3 short, distinct options for the user to choose from in response to the scenario. Only provide if the conversation is not over.'),
  isFinal: z.boolean().describe('A boolean indicating if this is the final turn of the simulation.'),
  feedbackPrompt: z.string().describe('A question to ask the user to gather feedback on whether they like the simulated career stream. This should only be provided on the final turn.'),
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
  prompt: `You are a career simulation expert, creating an interactive "day in the life" Q&A for a 10th-grade student. Your goal is to give them a feel for a career in '{{{careerStream}}}' over 2-3 turns.

User's Quiz Profile:
{{#each userPreferences}}- {{{this}}}{{/each}}

Conversation History:
{{#if conversationHistory}}
  {{#each conversationHistory}}
    **{{role}}**: {{content}}
  {{/each}}
{{else}}
  (No history yet)
{{/if}}

{{#if userResponse}}
User's latest response: {{{userResponse}}}
{{/if}}

TASK:
Your task is to generate the NEXT turn in the simulation.

- **If the conversation has had less than 2 model responses:**
  1.  Create a short, engaging scenario (2-3 sentences) related to '{{{careerStream}}}'.
  2.  Ask a multiple-choice question about the scenario.
  3.  Provide 2-3 distinct, short (2-5 words) options for the user to choose from.
  4.  Set 'isFinal' to false.

- **If the conversation has had 2 or more model responses:**
  1.  Provide a concluding scenario (2-3 sentences) that wraps up the "day in the life".
  2.  Do NOT provide 'options'.
  3.  Set 'isFinal' to true.
  4.  Provide a 'feedbackPrompt' asking the user if they enjoyed this type of work (e.g., "Did you enjoy this type of problem-solving?").
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
