'use server';

import { analyzeAptitude } from '@/ai/ai-career-analysis';
import DashboardClient from '@/components/dashboard-client';

export default async function DashboardPage() {
  // In a real app with server-side auth state, you would check the user here.
  // For this anonymous auth setup, we rely on the client to hold the state.
  // We pass the AI analysis function to the client component.
  
  return <DashboardClient aptitudeAnalysisAction={analyzeAptitude} />;
}
