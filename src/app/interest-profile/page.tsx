'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Brain, BookOpen, Lightbulb, Target, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionType = 'single' | 'multiple';

interface Question {
    id: string;
    type: QuestionType;
    question: string;
    options: string[];
    maxSelections?: number; // Only for multiple choice
    icon: any;
    category: string;
}

const quizQuestions: Question[] = [
    {
        id: 'interests',
        type: 'multiple',
        maxSelections: 2,
        icon: Brain,
        category: 'Primary interest domain',
        question: 'In your free time, what do you most enjoy doing? (Select up to 2)',
        options: [
            'Exploring how things work (science, tech, experiments)',
            'Solving problems, puzzles, or working with numbers',
            'Creating (drawing, writing, editing, designing)',
            'Helping, teaching, or working with people',
            'Thinking about business, money, or leadership ideas',
        ],
    },
    {
        id: 'subjects',
        type: 'multiple',
        icon: BookOpen,
        category: 'Academic comfort zone',
        question: 'Which subjects feel easiest or most interesting to you in school?',
        options: [
            'Mathematics',
            'Science',
            'Social Studies / Humanities',
            'Languages (English, regional languages)',
            'Computer / Practical subjects',
        ],
    },
    {
        id: 'style',
        type: 'single',
        icon: Lightbulb,
        category: 'Thinking & learning style',
        question: 'How do you usually approach a new or difficult problem?',
        options: [
            'Logical, step-by-step thinking',
            'Creative or trial-and-error ideas',
            'Discussing with others',
            'Looking at real-life examples',
            'I need guidance first',
        ],
    },
    {
        id: 'motivation',
        type: 'single',
        icon: Target,
        category: 'Core motivation',
        question: 'What do you expect most from your future career?',
        options: [
            'High income & stability',
            'Creativity & self-expression',
            'Solving challenging problems',
            'Helping society or people',
            'Leadership & decision-making',
        ],
    },
    {
        id: 'stream',
        type: 'single',
        icon: Compass,
        category: 'True inclination',
        question: 'If pressure and marks were not an issue, which stream would you choose?',
        options: [
            'Science',
            'Commerce',
            'Arts / Humanities',
            'Skill-based / Vocational',
            'Not sure',
        ],
    },
];

type Answers = { [key: string]: string | string[] };

export default function InterestProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSelections, setCurrentSelections] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const savedAnswer = answers[quizQuestions[currentQuestionIndex].id];
        if (Array.isArray(savedAnswer)) {
            setCurrentSelections(savedAnswer);
        } else if (savedAnswer) {
            setCurrentSelections([savedAnswer]);
        } else {
            setCurrentSelections([]);
        }
    }, [currentQuestionIndex, answers]);

    const handleOptionClick = (option: string) => {
        const question = quizQuestions[currentQuestionIndex];

        if (question.type === 'single') {
            setCurrentSelections([option]);
        } else {
            setCurrentSelections((prev) => {
                if (prev.includes(option)) {
                    return prev.filter((o) => o !== option);
                }
                if (question.maxSelections && prev.length >= question.maxSelections) {
                    return prev; // Max reached
                }
                return [...prev, option];
            });
        }
    };

    const handleNext = async () => {
        const question = quizQuestions[currentQuestionIndex];
        const value = question.type === 'multiple' ? currentSelections : currentSelections[0];

        const newAnswers = { ...answers, [question.id]: value! };
        setAnswers(newAnswers);

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Finish
            setIsSubmitting(true);
            if (user && firestore) {
                try {
                    // Save to 'interestProfile' or merge into 'profile' in Firestore
                    await setDoc(doc(firestore, 'users', user.uid), {
                        interestProfile: newAnswers,
                        profileCompletedAt: new Date().toISOString()
                    }, { merge: true });

                    router.push('/home'); // Redirect to Home after Interest Profile
                } catch (error) {
                    console.error("Error saving interest profile:", error);
                    setIsSubmitting(false);
                }
            }
        }
    }

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else {
            router.back();
        }
    }

    if (isUserLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center p-4">
                <Skeleton className="h-[400px] w-full max-w-2xl rounded-xl" />
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    const Icon = currentQuestion.icon;
    const isMultiple = currentQuestion.type === 'multiple';

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl">
                <Card className="shadow-2xl border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2 text-muted-foreground">
                                <ArrowLeft className="mr-1 h-4 w-4" /> Back
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">
                                Step {currentQuestionIndex + 1} of {quizQuestions.length}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="mt-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Icon className="h-6 w-6" />
                                <span className="text-sm font-semibold uppercase tracking-wider">{currentQuestion.category}</span>
                            </div>
                            <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                                {currentQuestion.question}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 mt-2">
                            {currentQuestion.options.map((option) => {
                                const isSelected = currentSelections.includes(option);
                                return (
                                    <div
                                        key={option}
                                        className={cn(
                                            "relative flex w-full cursor-pointer items-center rounded-xl border-2 p-4 transition-all hover:border-primary/50 hover:bg-muted/50",
                                            isSelected
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-muted bg-card"
                                        )}
                                        onClick={() => handleOptionClick(option)}
                                    >
                                        <div className={cn(
                                            "mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                                            isSelected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-muted-foreground/30"
                                        )}>
                                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                                        </div>
                                        <span className="text-base font-medium">{option}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-2 min-h-[80px]">
                        <Button
                            onClick={handleNext}
                            className="w-full sm:w-auto"
                            size="lg"
                            disabled={currentSelections.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (currentQuestionIndex === quizQuestions.length - 1 ? 'Go to Home' : 'Next Question')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
