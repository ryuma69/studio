'use server';

import DashboardClient from '@/components/dashboard-client';

async function getAptitudeAnalysis(answers: string[]) {
  // This mock logic provides deterministic results based on answers.
  const creativityScore = answers.filter(a => a.toLowerCase().includes('creative') || a.toLowerCase().includes('ideas') || a.toLowerCase().includes('designing')).length;
  
  let streams = ['Software Engineering', 'Data Science', 'UX/UI Design'];
  let recommendation = "You seem to have a balanced blend of logical and creative thinking. This versatility opens up several exciting career paths. Here are a few streams where you could thrive:";

  if (creativityScore >= 3) {
    streams = ['UX/UI Design', 'Graphic Design', 'Marketing'];
    recommendation = "Your creative spark is strong! You're drawn to innovation and design. Consider roles where you can build, innovate, and bring new ideas to life.";
  } else if (creativityScore <= 1) {
    streams = ['Software Engineering', 'Financial Analysis', 'Systems Administration'];
    recommendation = "Your logical and structured approach is a powerful asset. You'll excel in roles that involve deep problem-solving, data analysis, and building robust systems.";
  }

  // Ensure we always return 3 streams as per the requirement.
  const allStreams = ['Software Engineering', 'Data Science', 'UX/UI Design', 'Graphic Design', 'Marketing', 'Financial Analysis', 'Systems Administration'];
  let finalStreams = [...new Set([...streams, ...allStreams])];

  return {
    recommendation,
    careerStreams: finalStreams.slice(0, 3)
  };
}


export default async function DashboardPage() {
  // In a real app with server-side auth state, you would check the user here.
  // For this anonymous auth setup, we rely on the client to hold the state.
  // We pass the mock AI analysis function to the client component.
  
  return <DashboardClient aptitudeAnalysisAction={getAptitudeAnalysis} />;
}
