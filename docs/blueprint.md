# **App Name**: Career Compass AI

## Core Features:

- Anonymous Login: Frictionless entry with Firebase Anonymous Authentication. Collects full name upon entry.
- Interactive Quiz: 5-question personality quiz to assess user preferences. Sends answer array and time taken to backend for analysis.
- AI Career Analysis: API endpoint POST /api/aptitude/analyze using Gemini to interpret quiz answers, provide personalized career recommendation and up to 3 specific career streams in JSON format.
- Visual Roadmap: Display a 10-year roadmap with milestones for Year 1, Year 5, and Year 10 based on the selected career stream.
- Stream Explorer Simulation: Simulates the experience of a given stream and incorporates feedback from user, powered by the Gemini API using the tool paradigm.
- College Locator: Button to see nearby colleges. It triggers the google maps showing near by colleges.
- Detailed Report: Generates a report to explaining suitability and future worth of stream.

## Style Guidelines:

- Primary color: Dark green (#2E8B57) to evoke growth and stability, aligning with career development.
- Background color: Very light green (#F0FAF5), nearly white to give a clean and calming impression.
- Accent color: Teal (#008080) a contrasting color, while remaining aligned with a palette tied to personal growth
- Body and headline font: 'Inter', a sans-serif font, giving a clean and modern feel that supports readability and UI clarity.
- Use clear, professional icons to represent different career streams and milestones.
- Clean and intuitive layout to guide users through the quiz and career exploration process.
- Subtle animations to provide feedback during interactions, such as quiz submission and roadmap unfolding.