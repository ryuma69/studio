'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Book, TestTube, Paintbrush, Calculator, Lightbulb } from 'lucide-react';

const quizQuestions = [
  {
    id: 'q1',
    icon: TestTube,
    question: "'Ocean' is to 'Water' as 'Desert' is to...?",
    options: ['Cactus', 'Sand', 'Heat', 'Camel'],
  },
  {
    id: 'q2',
    icon: Calculator,
    question: 'If a notebook and a pencil cost $1.10 in total, and the notebook costs $1.00 more than the pencil, how much does the pencil cost?',
    options: ['$0.10', '$0.05', '$0.01', '$0.15'],
  },
  {
    id: 'q3',
    icon: Paintbrush,
    question: 'You have a square piece of paper. You fold it in half once, then in half again to make a smaller square. If you cut off one corner of the folded square and then unfold it, how many holes will be in the paper?',
    options: ['1', '2', '4', '8'],
  },
  {
    id: 'q4',
    icon: Lightbulb,
    question: 'If today is Monday, what day will it be in 63 days?',
    options: ['Monday', 'Tuesday', 'Sunday', 'Wednesday'],
  },
  {
    id: 'q5',
    icon: TestTube,
    question: 'Which number comes next? 1, 2, 4, 7, 11, ...',
    options: ['14', '15', '16', '17'],
  },
  {
    id: 'q6',
    icon: TestTube,
    question: "If Gear A is turning clockwise and is touching Gear B, which way is Gear B turning?",
    options: ['Clockwise', 'Counter-clockwise', "It won't move"],
  },
  {
    id: 'q7',
    icon: Book,
    question: "Which word is the most 'different' from the others?",
    options: ['Happy', 'Excited', 'Cheerful', 'Calm'],
  },
  {
    id: 'q8',
    icon: Book,
    question: 'A farmer has 17 sheep. All but 9 run away. How many sheep are left?',
    options: ['8', '9', '17', '0'],
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
