'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import html2canvas from 'html2canvas';
import {
  simulateCareerStream,
  type SimulateCareerStreamInput,
  type SimulateCareerStreamOutput,
  type ConversationTurn,
} from '@/ai/flows/stream-explorer-simulation';
import { generateDetailedReport, type DetailedReportOutput } from '@/ai/flows/detailed-report-generation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Bot, BookOpen, Map, FileText, ThumbsUp, ThumbsDown, Loader, LogOut, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import CareerRoadmap, { allCareerStreams } from './career-roadmap';
import CollegeLocator from './college-locator';
import DetailedReportChart from './detailed-report-chart';
import { AnalyzeAptitudeInput } from '@/ai/ai-career-analysis';

type AptitudeAnalysis = { careerRecommendation: string; careerStreams: string[] };
type QuizResults = { answers: string[]; timeTaken: number };

export default function DashboardClient({
  aptitudeAnalysisAction,
}: {
  aptitudeAnalysisAction: (input: AnalyzeAptitudeInput) => Promise<AptitudeAnalysis>;
}) {
  const router = useRouter();
  const [isSimulating, startSimulatingTransition] = useTransition();
  const [isReporting, startReportingTransition] = useTransition();

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [analysis, setAnalysis] = useState<AptitudeAnalysis | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulateCareerStreamOutput | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<ConversationTurn[]>([]);
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

      aptitudeAnalysisAction({ answers: parsedResults.answers, timeTaken: parsedResults.timeTaken }).then(
        analysisResult => {
          setAnalysis(analysisResult);
          setPageState('results');
        }
      );
    } else {
      console.error('Quiz data not found.');
      router.push('/quiz');
    }
  }, [user, isUserLoading, router, aptitudeAnalysisAction]);

  const handleSelectStream = (stream: string) => {
    setSelectedStream(stream);
    setSimulation(null);
    setSimulationFeedback(null);
    setFinalReport(null);
    setSimulationHistory([]);
  };

  const handleSimulate = (userResponse?: string) => {
    if (!selectedStream || !quizResults) return;

    startSimulatingTransition(async () => {
      try {
        const input: SimulateCareerStreamInput = {
          careerStream: selectedStream,
          userPreferences: quizResults.answers,
          conversationHistory: simulationHistory,
          userResponse: userResponse,
        };
        const result = await simulateCareerStream(input);
        setSimulation(result);
        if(userResponse) {
          setSimulationHistory(prev => [...prev, { role: 'user', content: userResponse }]);
        }
        setSimulationHistory(prev => [...prev, { role: 'model', content: result.scenario }]);

        setPageState('simulated');
      } catch (e) {
        console.error('Simulation Failed', e);
      }
    });
  };

  const handleSimulationFeedback = (feedback: 'positive' | 'negative') => {
    setSimulationFeedback(feedback);
  };

  const handleGenerateReport = () => {
    if (!selectedStream || !simulationFeedback || !quizResults) return;
    startReportingTransition(async () => {
      try {
        const result = await generateDetailedReport({
          careerStream: selectedStream,
          userFeedback: simulationFeedback,
          quizAnswers: quizResults.answers,
        });
        setFinalReport(result);
      } catch (e) {
        console.error('Report Failed', e);
      }
    });
  };
  
  const handleDownloadReport = () => {
    const chartElement = document.getElementById('report-chart-container');
    if (!chartElement || !finalReport || !selectedStream) {
      console.error("Report data or chart element not found for PDF generation.");
      return;
    }

    html2canvas(chartElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#F0FAF5',
      onclone: (clonedDoc) => {
        const content = clonedDoc.querySelector('.mx-auto.aspect-square');
        if (content) {
          (content as HTMLElement).style.maxHeight = 'none';
          (content as HTMLElement).style.width = '450px';
          (content as HTMLElement).style.height = '450px';
        }
      }
    }).then(canvas => {
      const chartImgData = canvas.toDataURL('image/png', 1.0);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Could not open a new window for printing. Please check your browser's popup settings.");
        return;
      }

      const reportHTML = `
        <html>
          <head>
            <title>Detailed Career Report for ${selectedStream}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
              .container { max-width: 800px; margin: 0 auto; }
              h1 { text-align: center; font-size: 28px; margin-bottom: 20px; color: #000; }
              h2 { font-size: 22px; margin-top: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; color: #000; }
              img { max-width: 100%; height: auto; display: block; margin: 30px auto; border: 1px solid #ddd; border-radius: 8px; }
              ul { padding-left: 20px; }
              li { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Detailed Career Report for ${selectedStream}</h1>

              <h2>Aptitude Analysis</h2>
              <img src="${chartImgData}" alt="Aptitude Scores Chart" />

              <h2>Strengths</h2>
              <p>${finalReport.strengths}</p>

              <h2>Suitability for ${selectedStream}</h2>
              <p>${finalReport.suitability}</p>

              <h2>Future Job Prospects</h2>
              <ul>
                ${finalReport.jobProspects.map(job => `<li>${job}</li>`).join('')}
              </ul>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (e) {
          console.error("Printing failed:", e);
          printWindow.close();
        }
      }, 500);
    });
  };

  const handleExit = async () => {
    await signOut(auth);
    localStorage.removeItem('quizResults');
    router.push('/');
  };

  const recommendedStreams = analysis?.careerStreams || [];
  const otherStreams = allCareerStreams.filter(stream => !recommendedStreams.includes(stream));

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
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-primary">Your Career Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {user?.displayName || 'Explorer'}. Here is your personalized path forward.
          </p>
        </div>
        <Button variant="outline" onClick={handleExit}>
          <LogOut className="mr-2" />
          Exit
        </Button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysis?.careerRecommendation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Explore Career Paths</CardTitle>
              <CardDescription>Click a path to explore its roadmap and simulate a day-in-the-life.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-base font-semibold">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Recommended For You
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    {recommendedStreams.map(stream => (
                      <Button
                        key={stream}
                        variant={selectedStream === stream ? 'default' : 'secondary'}
                        className="w-full justify-between"
                        onClick={() => handleSelectStream(stream)}
                      >
                        {stream}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-base font-semibold">
                     <div className="flex items-center gap-2">
                       <BookOpen className="h-5 w-5 text-muted-foreground"/>
                        Other Paths
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    {otherStreams.map(stream => (
                      <Button
                        key={stream}
                        variant={selectedStream === stream ? 'default' : 'secondary'}
                        className="w-full justify-between"
                        onClick={() => handleSelectStream(stream)}
                      >
                        {stream}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen /> {selectedStream} - 5-Year Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CareerRoadmap stream={selectedStream} />
                  <Button onClick={() => handleSimulate()} disabled={isSimulating} className="mt-4 w-full">
                    {isSimulating ? (
                      <><Loader className="animate-spin mr-2" />Simulating...</>
                    ) : (
                      `Simulate a Day in ${selectedStream}`
                    )}
                  </Button>
                </CardContent>
              </Card>

              {(isSimulating || simulation) && (
                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot /> Stream Explorer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSimulating && !simulation && (
                      <div className="space-y-2 animate-pulse">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    )}
                    {simulation && (
                      <div className="space-y-4">
                        <p className="italic">{simulation.scenario}</p>
                        {!simulation.isFinal && simulation.options ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {simulation.options.map((option, index) => (
                              <Button key={index} variant="outline" onClick={() => handleSimulate(option)} disabled={isSimulating}>
                                {isSimulating ? <Loader className="animate-spin mr-2"/> : null}
                                {option}
                              </Button>
                            ))}
                          </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="font-semibold">{simulation.feedbackPrompt}</p>
                                <div className="flex gap-4">
                                    <Button variant={simulationFeedback === 'positive' ? 'default' : 'outline'} onClick={() => handleSimulationFeedback('positive')}><ThumbsUp className="mr-2"/> I like this</Button>
                                    <Button variant={simulationFeedback === 'negative' ? 'destructive' : 'outline'} onClick={() => handleSimulationFeedback('negative')}><ThumbsDown className="mr-2"/> Not for me</Button>
                                </div>
                            </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {simulationFeedback && (
                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Map className="mr-2" /> Find Nearby Colleges
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl h-[90vh] md:h-[550px] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Colleges for {selectedStream}</DialogTitle>
                        </DialogHeader>
                        <CollegeLocator />
                      </DialogContent>
                    </Dialog>
                    <Dialog onOpenChange={open => !open && setFinalReport(null)}>
                      <DialogTrigger asChild>
                        <Button onClick={handleGenerateReport} disabled={isReporting} className="w-full">
                          <FileText className="mr-2" /> {isReporting ? 'Generating...' : 'Get Detailed Report'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent id="detailed-report-dialog-content" className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Your Detailed Career Report</DialogTitle>
                        </DialogHeader>
                        {isReporting && (
                          <div className="space-y-2 p-4 animate-pulse">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        )}
                        {finalReport && (
                            <div className="p-4">
                                <div id="report-chart-container">
                                    <DetailedReportChart data={finalReport.aptitudeScores} onDownload={handleDownloadReport} />
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Strengths:</h3>
                                    <p className="text-sm text-muted-foreground">{finalReport.strengths}</p>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Suitability for {selectedStream}:</h3>
                                    <p className="text-sm text-muted-foreground">{finalReport.suitability}</p>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Future Job Prospects:</h3>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {finalReport.jobProspects.map((job, index) => <li key={`${job}-${index}`}>{job}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
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
