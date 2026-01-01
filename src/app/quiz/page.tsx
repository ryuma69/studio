'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Book, TestTube, Paintbrush, Calculator, Lightbulb } from 'lucide-react';

const quizQuestions = [
  {
    id: 'q1',
    icon: TestTube,
    question: 'Which subject do you enjoy more?',
    options: ['Science (Physics, Chemistry, Biology)', 'Maths and Accountancy'],
  },
  {
    id: 'q2',
    icon: Book,
    question: 'You prefer to learn by:',
    options: ['Reading theories and historical accounts', 'Doing hands-on experiments and building things'],
  },
  {
    id: 'q3',
    icon: Paintbrush,
    question: 'In your free time, you are more likely to:',
    options: ['Sketch, paint, or write stories', 'Solve puzzles or play strategy games'],
  },
  {
    id: 'q4',
    icon: Calculator,
    question: 'When planning a project, you focus on:',
    options: ['The budget and economic viability', 'The creative vision and final look'],
  },
  {
    id: 'q5',
    icon: Lightbulb,
    question: 'Your friends would describe you as more:',
    options: ['Analytical and logical', 'Imaginative and artistic'],
  },
];

type Answers = { [key: string]: string };

export default function QuizPage() {
  const { user, isUserLoading } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
    if (user && !startTime) {
      setStartTime(Date.now());
    }
  }, [user, isUserLoading, router, startTime]);

  const handleAnswer = (option: string) => {
    const newAnswers = { ...answers, [quizQuestions[currentQuestionIndex].id]: option };
    setAnswers(newAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const endTime = Date.now();
      const timeTaken = Math.round((endTime - (startTime ?? endTime)) / 1000);
      
      const answersArray = quizQuestions.map(q => newAnswers[q.id] || '');

      localStorage.setItem('quizResults', JSON.stringify({ answers: answersArray, timeTaken }));
      
      router.push('/dashboard');
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-40 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const Icon = currentQuestion.icon;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold">Aptitude Quiz</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Go back">
                <ArrowLeft className="h-5 w-5"/>
              </Button>
            </div>
            <CardDescription>Question {currentQuestionIndex + 1} of {quizQuestions.length}</CardDescription>
            <Progress value={progress} aria-label={`Quiz progress: ${progress}%`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-center text-lg font-medium md:text-xl" role="status">
                {currentQuestion.question}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className="h-auto min-h-[60px] whitespace-normal text-base"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
