'use server';

/**
 * @fileOverview A career stream simulation AI agent that creates a "Day in the Life" experience.
 *
 * - simulateCareerStream - A function that generates a full day simulation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SimulationScenarioSchema = z.object({
  id: z.string().describe('Unique identifier for the scenario'),
  timeOfDay: z.string().describe('e.g., "9:00 AM", "After Lunch"'),
  title: z.string().describe('Short title for the activity'),
  description: z.string().describe('Description of the situation or task.'),
  challenge: z.string().describe('A specific question or decision point for the student.'),
  options: z.array(z.string()).describe('2-3 distinct options for the user to choose from.'),
});

const SimulateCareerStreamInputSchema = z.object({
  careerStream: z.string().describe('The career stream to simulate (e.g., Software Engineering).'),
  userPreferences: z.array(z.string()).describe('User preferences from the quiz.'),
});
export type SimulateCareerStreamInput = z.infer<typeof SimulateCareerStreamInputSchema>;

const SimulateCareerStreamOutputSchema = z.object({
  introduction: z.string().describe('Welcome message setting the scene for the career.'),
  scenarios: z.array(SimulationScenarioSchema).describe('3-4 chronological scenarios representing a typical day.'),
  conclusion: z.string().describe('Encouraging closing message asking for feedback.'),
});
export type SimulateCareerStreamOutput = z.infer<typeof SimulateCareerStreamOutputSchema>;

const MOCK_SIMULATION: SimulateCareerStreamOutput = {
  introduction: "Welcome to your day as a professional! You're about to step into the shoes of an expert in this field. Get ready to make decisions that professionals make every day.",
  scenarios: [
    {
      id: "s1",
      timeOfDay: "9:00 AM",
      title: "Morning Kickoff",
      description: "You arrive at the workspace. The team is gathering for the daily stand-up meeting to discuss progress on the new project.",
      challenge: "A critical bug was reported by a user overnight. It needs immediate attention, but you also have a feature deadline today.",
      options: ["Prioritize the bug fix immediately", "Delegate the bug to a junior dev", "Stick to the feature plan and fix bug later"]
    },
    {
      id: "s2",
      timeOfDay: "1:00 PM",
      title: "Deep Work Session",
      description: "After lunch, you have a block of time for focused work on the core architecture of the application.",
      challenge: "You realize the current design won't scale well for future users. Refactoring now will delay the release.",
      options: ["Refactor now for long-term health", "Stick to current design to meet deadline", "Consult with the lead architect"]
    },
    {
      id: "s3",
      timeOfDay: "4:00 PM",
      title: "Client Presentation",
      description: "You are presenting the prototype to the client stakeholders. They seem skeptical about one of the features.",
      challenge: "The client suggests removing a key feature you believe is essential.",
      options: ["Defend the feature with data", "Accept their feedback and remove it", "Propose a compromise version"]
    }
  ],
  conclusion: "Great job today! You experienced the balancing act of a professional in this field. You showed good decision-making skills."
};

<<<<<<< HEAD
const prompt = ai!.definePrompt({
=======
const prompt = ai ? ai.definePrompt({
>>>>>>> d4e3f69bc80057d8d1a3fd533acdfbcc2cfcc108
  name: 'simulateCareerStreamPrompt',
  input: { schema: SimulateCareerStreamInputSchema },
  output: { schema: SimulateCareerStreamOutputSchema },
  prompt: `You are a career simulation expert. Create a "Day in the Life" simulation for a 10th-grade student interested in '{{{careerStream}}}'.

User's Quiz Profile:
{{#each userPreferences}}- {{{this}}}{{/each}}

TASK:
Generate a valid JSON object describing a single day in this career.
- **introduction**: A brief, exciting welcome.
- **scenarios**: Generate exactly 3 distinct scenarios (e.g., Morning, Afternoon, Evening) that highlight different aspects of the job (creativity, logic, teamwork).
  - For each scenario, provide a **challenge** (a question) and 2-3 **options** for the user to decide how to handle it.
- **conclusion**: A wrap-up message.

Unconditionally output a valid JSON object conforming to the schema.
Do not output the JSON schema itself as part of the object.
Do not wrap the output in any extra keys like "properties" or "type".
The root object directly contains:
{
  "introduction": "...",
  "scenarios": [...],
  "conclusion": "..."
}
`,
}) : null;

<<<<<<< HEAD
const simulateCareerStreamFlow = ai!.defineFlow(
=======
const simulateCareerStreamFlow = ai ? ai.defineFlow(
>>>>>>> d4e3f69bc80057d8d1a3fd533acdfbcc2cfcc108
  {
    name: 'simulateCareerStreamFlow',
    inputSchema: SimulateCareerStreamInputSchema,
    outputSchema: SimulateCareerStreamOutputSchema,
  },
  async input => {
    if (!prompt) throw new Error("Prompt not defined");
    const { output } = await prompt(input);
    return output!;
  }
) : null;

export async function simulateCareerStream(
  input: SimulateCareerStreamInput
): Promise<SimulateCareerStreamOutput> {
  if (!simulateCareerStreamFlow) {
    console.log("Mock Mode: Returning simulation mock.");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_SIMULATION;
  }
  return simulateCareerStreamFlow(input);
}
