'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, getDocs, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import html2canvas from 'html2canvas';
import {
  simulateCareerStream,
  type SimulateCareerStreamInput,
  type SimulateCareerStreamOutput,
} from '@/ai/flows/stream-explorer-simulation';
import { generateDetailedReport, type DetailedReportOutput } from '@/ai/flows/detailed-report-generation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Bot, BookOpen, Map as MapIcon, FileText, ThumbsUp, ThumbsDown, Loader, LogOut, Sparkles } from 'lucide-react';
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
  const firestore = useFirestore(); // Hook

  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [analysis, setAnalysis] = useState<AptitudeAnalysis | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulateCareerStreamOutput | null>(null);
  const [simulationFeedback, setSimulationFeedback] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<DetailedReportOutput | null>(null);

  const [pageState, setPageState] = useState<'loading' | 'analyzing' | 'results' | 'simulated' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Auto-open report if found in DB on load
  useEffect(() => {
    if (finalReport && pageState === 'results') {
      setIsReportOpen(true);
    }
  }, [finalReport, pageState]);

  useEffect(() => {
    if (isUserLoading) {
      // ... (keep existing code till DialogContent start)

      setPageState('loading');
      return;
    }
    if (!user) {
      router.push('/');
      return;
    }

    const checkResults = async () => {
      if (!user || !firestore) return;

      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // 1. Existing Analysis (Dashboard Summary)
          if (userData.careerAnalysis) {
            setAnalysis(userData.careerAnalysis as AptitudeAnalysis);
            setPageState('results');
          }

          // 2. Existing Quiz Results (Context)
          if (userData.aptitudeResults) {
            const { answers, timeTaken } = userData.aptitudeResults;
            const answersArray = Array.isArray(answers) ? answers : (answers && typeof answers === 'object' ? Object.values(answers) : []);
            setQuizResults({ answers: answersArray, timeTaken: timeTaken || 0 });
          }

          // 3. Fetch Latest Detailed Report from Subcollection
          // We look for the most recent report in users/{uid}/reports
          const reportsRef = collection(firestore, 'users', user.uid, 'reports');
          const q = query(reportsRef, orderBy('generatedAt', 'desc'), limit(1));
          const querySnapshot = await getDocs(q);

          let latestReportData = null;
          let streamName = '';

          if (!querySnapshot.empty) {
            const reportDoc = querySnapshot.docs[0].data() as any;
            latestReportData = reportDoc.report;
            streamName = reportDoc.stream;
            console.log("Found detailed report in subcollection");
          } else if (userData.report) {
            // Fallback to field if subcollection empty (legacy support)
            console.log("Found detailed report in user field");
            if (userData.report.report) {
              latestReportData = userData.report.report;
              streamName = userData.report.stream;
            } else {
              latestReportData = userData.report; // Assume direct object
            }
          }

          if (latestReportData && latestReportData.strengths && latestReportData.suitability) {
            setFinalReport(latestReportData as DetailedReportOutput);
            if (streamName) setSelectedStream(streamName);
            // Note: The useEffect will handle auto-opening the dialog
          }

          if (userData.careerAnalysis) return;

          // If no analysis yet, fallback to calculating it if results exist
          if (userData.aptitudeResults && !userData.careerAnalysis) {
            const { answers, timeTaken } = userData.aptitudeResults;
            const answersArray = Array.isArray(answers) ? answers : (answers && typeof answers === 'object' ? Object.values(answers) : []);
            const resultsFromDB = { answers: answersArray, timeTaken: timeTaken || 0 };

            setQuizResults(resultsFromDB);
            setPageState('analyzing');
            fetchQuestionsAndAnalyze(resultsFromDB);
            return;
          }
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }

      // 4. Fallback/Redirect
      console.error('No quiz data found in DB.');
      router.push('/aptitude-test');
    };

    const fetchQuestionsAndAnalyze = async (r: QuizResults) => {
      if (!firestore) return;

      try {
        const questionsSnapshot = await getDocs(collection(firestore, 'questions'));
        const questionsMap = new Map();
        questionsSnapshot.forEach(doc => {
          questionsMap.set(doc.id, doc.data().question);
        });

        // Reconstruct detailed answers.
        const currentAnswers = r.answers || [];

        const detailedAnswers = currentAnswers.map((ans, idx) => {
          const qId = `q${idx + 1}`;
          const questionText = questionsMap.has(qId) ? questionsMap.get(qId) : `Question ${idx + 1}`;
          return {
            question: questionText,
            answer: ans
          };
        });

        const analysisResult = await aptitudeAnalysisAction({
          detailedAnswers,
          timeTaken: r.timeTaken
        });

        setAnalysis(analysisResult);
        setPageState('results');

        // Persist Analysis
        if (user) {
          await setDoc(doc(firestore, 'users', user.uid), {
            careerAnalysis: {
              ...analysisResult,
              analyzedAt: new Date().toISOString()
            }
          }, { merge: true });
        }

      } catch (err) {
        console.error("Error during analysis flow:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        setPageState('error');
      }
    };

    checkResults();
  }, [user, isUserLoading, firestore, router, aptitudeAnalysisAction]);

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
        const input: SimulateCareerStreamInput = {
          careerStream: selectedStream,
          userPreferences: quizResults.answers,
        };
        const result = await simulateCareerStream(input);
        setSimulation(result);
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

        // Persist Report
        if (firestore && user) {
          try {
            await addDoc(collection(firestore, 'users', user.uid, 'reports'), {
              stream: selectedStream,
              report: result,
              generatedAt: new Date().toISOString()
            });
          } catch (err) {
            console.error("Failed to save report to DB", err);
          }
        }

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
    // Just clear local session state, don't sign out user from Firebase
    localStorage.removeItem('quizResults');
    router.push('/home');
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

  if (pageState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="mb-4">{error || "Something went wrong while communicating with the AI."}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Button variant="link" className="mt-2" onClick={handleExit}>Go Home</Button>
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
        <div className="flex gap-2">
          {finalReport && (
            <Button onClick={() => setIsReportOpen(true)} className="bg-green-600 hover:bg-green-700">
              <FileText className="mr-2" /> View Detailed Parent Report
            </Button>
          )}
          <Button variant="outline" onClick={handleExit}>
            <LogOut className="mr-2" />
            Exit
          </Button>
        </div>
      </header>

      {/* Detailed Report Dialog (Moved outside of stream logic for global access) */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent id="detailed-report-dialog-content" className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary">Your Comprehensive Career Report</DialogTitle>
            <CardDescription className="text-center">
              Analysis for {selectedStream}
            </CardDescription>
          </DialogHeader>
          {finalReport && (
            <div className="p-2 space-y-6">
              <div id="report-chart-container" className="flex justify-center bg-white p-4 rounded-xl border shadow-sm">
                <DetailedReportChart data={finalReport.aptitudeScores} onDownload={handleDownloadReport} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20">
                  <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" /> Key Strengths
                  </h3>
                  <p className="text-sm leading-relaxed">{finalReport.strengths}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/20">
                  <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <MapIcon className="h-5 w-5" /> Suitability Analysis
                  </h3>
                  <p className="text-sm leading-relaxed">{finalReport.suitability}</p>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-lg border border-purple-100 dark:border-purple-900/20">
                <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Future Career Opportunities
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {finalReport.jobProspects.map((job, index) => (
                    <li key={`${job}-${index}`} className="flex items-start gap-2 text-sm bg-background/50 p-2 rounded">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                      {job}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleDownloadReport} className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" /> Download PDF Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
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
                      `Simulate a Day in ${selectedStream} `
                    )}
                  </Button>
                </CardContent>
              </Card>

              {(isSimulating || simulation) && (
                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot /> Stream Explorer: Day in the Life
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSimulating && !simulation && (
                      <div className="space-y-4 animate-pulse">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    )}
                    {simulation && (
                      <div className="space-y-6">
                        <div className="bg-white/50 p-4 rounded-lg">
                          <p className="text-lg font-medium">{simulation.introduction}</p>
                        </div>

                        <div className="space-y-4">
                          {simulation.scenarios.map((scenario: any, idx: number) => (
                            <Card key={idx} className="border-l-4 border-l-primary">
                              <CardHeader className="py-3">
                                <CardTitle className="text-base font-bold flex justify-between">
                                  <span>{scenario.title}</span>
                                  <span className="text-sm font-normal text-muted-foreground">{scenario.timeOfDay}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-3 space-y-3">
                                <p>{scenario.description}</p>
                                <div className="bg-muted p-3 rounded-md">
                                  <p className="font-medium text-sm mb-2">Challenge: {scenario.challenge}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {scenario.options.map((opt: string, i: number) => (
                                      <span key={i} className="text-xs bg-background border px-2 py-1 rounded shadow-sm text-muted-foreground">
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="bg-white/50 p-4 rounded-lg space-y-4">
                          <p>{simulation.conclusion}</p>
                          <div className="space-y-2">
                            <p className="font-semibold text-center">Did you find this career path interesting?</p>
                            <div className="flex justify-center gap-4">
                              <Button variant={simulationFeedback === 'positive' ? 'default' : 'outline'} onClick={() => handleSimulationFeedback('positive')}>
                                <ThumbsUp className="mr-2 h-4 w-4" /> Yes, I like it
                              </Button>
                              <Button variant={simulationFeedback === 'negative' ? 'destructive' : 'outline'} onClick={() => handleSimulationFeedback('negative')}>
                                <ThumbsDown className="mr-2 h-4 w-4" /> Not for me
                              </Button>
                            </div>
                          </div>
                        </div>
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
                          <MapIcon className="mr-2" /> Find Nearby Colleges
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl h-[90vh] md:h-[550px] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Colleges for {selectedStream}</DialogTitle>
                        </DialogHeader>
                        <CollegeLocator />
                      </DialogContent>
                    </Dialog>
                    {/* The second button here is redundant if we view report via header, but we keep it for flow purposes */}
                    <div />
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
