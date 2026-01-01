'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { simulateCareerStream, type SimulateCareerStreamOutput } from '@/ai/flows/stream-explorer-simulation';
import { generateDetailedReport, type DetailedReportOutput } from '@/ai/flows/detailed-report-generation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Bot, BookOpen, Map, FileText, ThumbsUp, ThumbsDown, Loader } from 'lucide-react';

import CareerRoadmap from './career-roadmap';
import CollegeLocator from './college-locator';
import { AnalyzeAptitudeInput } from '@/ai/ai-career-analysis';

type AptitudeAnalysis = { recommendation: string; careerStreams: string[] };
type QuizResults = { answers: string[], timeTaken: number };

export default function DashboardClient({ aptitudeAnalysisAction }: { aptitudeAnalysisAction: (input: AnalyzeAptitudeInput) => Promise<AptitudeAnalysis> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSimulating, startSimulatingTransition] = useTransition();
  const [isReporting, startReportingTransition] = useTransition();

  const { user, isUserLoading } = useUser();
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [analysis, setAnalysis] = useState<AptitudeAnalysis | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulateCareerStreamOutput | null>(null);
  const [simulationFeedback, setSimulationFeedback] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<DetailedReportOutput | null>(null);
  
  const [pageState, setPageState] = useState<'loading' | 'analyzing' | 'results' | 'simulated'>('loading');

  useEffect(() => {
    if (isUserLoading) {
      setPageState('loading');
      return;
    }
    if (!user) {
        router.push('/');
        return;
    }

    const results = localStorage.getItem('quizResults');
    if (results) {
      const parsedResults = JSON.parse(results) as QuizResults;
      setQuizResults(parsedResults);
      setPageState('analyzing');
      
      aptitudeAnalysisAction({ answers: parsedResults.answers, timeTaken: parsedResults.timeTaken }).then(analysisResult => {
          setAnalysis(analysisResult);
          setPageState('results');
      });
      
    } else {
      toast({ title: "Quiz data not found.", description: "Redirecting you to the quiz.", variant: "destructive" });
      router.push('/quiz');
    }
  }, [user, isUserLoading, router, toast, aptitudeAnalysisAction]);


  const handleSelectStream = (stream: string) => {
    setSelectedStream(stream);
    setSimulation(null);
    setSimulationFeedback(null);
    setFinalReport(null);
  };
  
  const handleSimulate = () => {
    if (!selectedStream || !quizResults) return;
    
    startSimulatingTransition(async () => {
        try {
            const result = await simulateCareerStream({ careerStream: selectedStream, userPreferences: quizResults.answers });
            setSimulation(result);
            setPageState('simulated');
        } catch(e) {
            toast({ title: "Simulation Failed", description: "Could not generate simulation. Please try again.", variant: "destructive" });
        }
    });
  };

  const handleSimulationFeedback = (feedback: 'positive' | 'negative') => {
    setSimulationFeedback(feedback);
  }

  const handleGenerateReport = () => {
    if (!selectedStream || !simulationFeedback || !quizResults) return;
    startReportingTransition(async () => {
        try {
            const result = await generateDetailedReport({
                careerStream: selectedStream,
                userFeedback: simulationFeedback,
                quizAnswers: quizResults.answers
            });
            setFinalReport(result);
        } catch(e) {
            toast({ title: "Report Failed", description: "Could not generate report. Please try again.", variant: "destructive" });
        }
    });
  }

  if (pageState === 'loading' || pageState === 'analyzing') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <Bot className="h-16 w-16 text-primary animate-bounce mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Analyzing your results...</h2>
        <p className="text-muted-foreground">Our AI is charting the best path for you after 10th grade.</p>
        <div className="w-full max-w-lg mt-8 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-primary">Your Career Dashboard</h1>
        <p className="text-lg text-muted-foreground">Welcome, {user?.displayName || 'Explorer'}. Here is your personalized path forward.</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle>AI Recommendation</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{analysis?.recommendation}</p></CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Example Career Paths</CardTitle>
                    <CardDescription>Click a path to explore.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {analysis?.careerStreams.map(stream => (
                        <Button key={stream} variant={selectedStream === stream ? 'default' : 'secondary'} className="w-full justify-between" onClick={() => handleSelectStream(stream)}>
                            {stream}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!selectedStream ? (
            <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">Select a career path on the left to see your educational roadmap.</p>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen/> {selectedStream} - 5-Year Roadmap</CardTitle></CardHeader>
                <CardContent>
                    <CareerRoadmap stream={selectedStream} />
                    <Button onClick={handleSimulate} disabled={isSimulating} className="mt-4 w-full">
                        {isSimulating ? <><Loader className="animate-spin mr-2"/>Simulating...</> : `Simulate a Day in ${selectedStream}`}
                    </Button>
                </CardContent>
              </Card>

              {(isSimulating || simulation) && (
                <Card className="bg-primary/5">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Bot/> Stream Explorer</CardTitle></CardHeader>
                    <CardContent>
                        {isSimulating ? (
                            <div className="space-y-2 animate-pulse"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
                        ) : simulation && (
                            <div className="space-y-4">
                                <p className="italic">{simulation.scenario}</p>
                                <p className="font-semibold">{simulation.feedbackPrompt}</p>
                                <div className="flex gap-4">
                                    <Button variant={simulationFeedback === 'positive' ? 'default' : 'outline'} onClick={() => handleSimulationFeedback('positive')}><ThumbsUp className="mr-2"/> I like this</Button>
                                    <Button variant={simulationFeedback === 'negative' ? 'destructive' : 'outline'} onClick={() => handleSimulationFeedback('negative')}><ThumbsDown className="mr-2"/> Not for me</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
              )}

              {simulationFeedback && (
                <Card>
                    <CardHeader><CardTitle>What's Next?</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <Dialog>
                            <DialogTrigger asChild><Button variant="outline" className="w-full"><Map className="mr-2"/> Find Nearby Colleges</Button></DialogTrigger>
                            <DialogContent className="max-w-3xl h-[90vh] md:h-[550px] flex flex-col"><DialogHeader><DialogTitle>Colleges for {selectedStream}</DialogTitle></DialogHeader><CollegeLocator /></DialogContent>
                        </Dialog> 
                        <Dialog onOpenChange={(open) => !open && setFinalReport(null)}>
                            <DialogTrigger asChild><Button onClick={handleGenerateReport} disabled={isReporting} className="w-full"><FileText className="mr-2"/> {isReporting ? 'Generating...' : 'Get Detailed Report'}</Button></DialogTrigger>
                             <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Your Detailed Career Report</DialogTitle></DialogHeader>
                                {isReporting && <div className="space-y-2 p-4 animate-pulse"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>}
                                {finalReport && <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto p-1" dangerouslySetInnerHTML={{ __html: finalReport.report.replace(/\n/g, '<br />') }} />}
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
