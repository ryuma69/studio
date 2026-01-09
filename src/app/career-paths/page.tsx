'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, BookOpen, Briefcase, GraduationCap, ChevronRight, Milestone, MapPin, Cpu, Stethoscope, Landmark, Scale, Palette, Shield, Bot, Megaphone, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore } from '@/firebase/provider';
import { collection, getDocs, query } from 'firebase/firestore';

// Initial Popular Streams Data (can be enriched by AI)
const POPULAR_STREAMS = [
    { id: 'science_eng', title: 'Engineering & Tech', icon: <Cpu className="w-8 h-8 text-blue-500" />, description: 'For the innovators and problem solvers building the future.', pivot: 'Can pivot to: MBA, Product Management, Design' },
    { id: 'science_med', title: 'Medical & Healthcare', icon: <Stethoscope className="w-8 h-8 text-green-500" />, description: 'Dedicated to saving lives and advancing health sciences.', pivot: 'Can pivot to: Hospital Admin, Research, Public Health' },
    { id: 'commerce_ca', title: 'Finance & Commerce', icon: <LineChart className="w-8 h-8 text-indigo-500" />, description: 'Driving the economy through finance, trade, and business.', pivot: 'Can pivot to: Law, Data Analysis, Entrepreneurship' },
    { id: 'arts_law', title: 'Law & Humanities', icon: <Scale className="w-8 h-8 text-amber-600" />, description: 'Championing justice, policy, and social understanding.', pivot: 'Can pivot to: Journalism, Politics, Corporate Consultant' },
    { id: 'vocational_design', title: 'Design & Creative', icon: <Palette className="w-8 h-8 text-pink-500" />, description: 'Shaping the visual world through art, design, and media.', pivot: 'Can pivot to: Marketing, UI/UX, Direction' },
    { id: 'defense_nda', title: 'Defense & Public Service', icon: <Shield className="w-8 h-8 text-red-600" />, description: 'Serving the nation with honor, discipline, and leadership.', pivot: 'Can pivot to: Security Consulting, Admin Services' },
    { id: 'tech_ai', title: 'AI & Data Science', icon: <Bot className="w-8 h-8 text-purple-500" />, description: 'Leading the AI revolution with data and algorithms.', pivot: 'Can pivot to: Research, FinTech, Robotics' },
    { id: 'comm_marketing', title: 'Marketing & Media', icon: <Megaphone className="w-8 h-8 text-orange-500" />, description: 'Connecting brands with people through storytelling.', pivot: 'Can pivot to: Sales, PR, Event Management' }
];

// Interactive Roadmap Component
const InteractiveRoadmap = ({ streamId, data }: { streamId: string, data: any }) => {
    // If we have DB data, use it. Otherwise, generate a generic visual structure.
    const steps = data && data.length > 0 ? data : [
        { year: 'Foundation', milestone: 'Class 11 & 12', details: 'Focus on core subjects. Build strong basics.' },
        { year: 'Entrance', milestone: 'Competitive Exams', details: 'Prepare for national/state level entrance tests.' },
        { year: 'Undergrad', milestone: 'Bachelor Degree', details: '3-4 years of intense academic and practical learning.' },
        { year: 'Skill Up', milestone: 'Internships & Projects', details: 'Gain real-world experience and build a portfolio.' },
        { year: 'Professional', milestone: 'First Job / Higher Ed', details: 'Enter the workforce or pursue Masters.' }
    ];

    return (
        <div className="relative p-6 ml-4 border-l-2 border-dashed border-primary/30 space-y-12">
            {steps.map((step: any, index: number) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                >
                    {/* Node Point */}
                    <div className={`absolute -left-[39px] top-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background shadow-sm ${index === steps.length - 1 ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                        {index === 0 ? <BookOpen size={16} /> :
                            index === steps.length - 1 ? <Briefcase size={16} /> :
                                <Milestone size={16} />}
                    </div>

                    {/* Content Card */}
                    <Card className="hover:shadow-lg transition-shadow border-primary/10 bg-gradient-to-br from-background to-muted/20">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{step.year}</span>
                            </div>
                            <CardTitle className="text-lg">{step.milestone}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                            {step.details}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

export default function CareerPathsPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const [selectedStream, setSelectedStream] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [dbRoadmaps, setDbRoadmaps] = useState<any>({});

    // Fetch verified roadmaps from DB
    useEffect(() => {
        const loadData = async () => {
            if (!firestore) return;
            try {
                const q = query(collection(firestore, 'careerPaths'));
                const snapshot = await getDocs(q);
                const map: any = {};
                snapshot.forEach(doc => {
                    map[doc.id] = doc.data();
                });
                setDbRoadmaps(map);
            } catch (e) {
                console.error("Failed to load roadmaps", e);
            }
        };
        loadData();
    }, [firestore]);

    const handleStreamClick = (stream: any) => {
        setSelectedStream(stream);
        setIsSheetOpen(true);
    };

    const getRoadmapData = (id: string) => {
        // Try to find matching ID in DB
        return dbRoadmaps[id]?.roadmap || null;
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <Button variant="ghost" onClick={() => router.push('/home')} className="mb-4 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                            Popular Career Streams
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            AI-curated pathways for life after 10th grade. Click to explore your future.
                        </p>
                    </div>
                    {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Interests</Button> */}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {POPULAR_STREAMS.map((stream) => (
                    <motion.div
                        key={stream.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className="h-full cursor-pointer hover:border-primary border-transparent shadow-sm hover:shadow-xl transition-all duration-300 group bg-card"
                            onClick={() => handleStreamClick(stream)}
                        >
                            <CardHeader>
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 transform origin-left">
                                    {stream.icon}
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                    {stream.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {stream.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary/80 transition-colors">
                                    View Roadmap <ChevronRight className="ml-1 h-3 w-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-[95vw] sm:w-[600px] overflow-hidden flex flex-col p-0">
                    {selectedStream && (
                        <>
                            <SheetHeader className="p-6 pb-2 border-b bg-muted/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-4xl shadow-sm bg-background rounded-full p-2">{selectedStream.icon}</span>
                                    <div>
                                        <SheetTitle className="text-2xl text-primary">{selectedStream.title}</SheetTitle>
                                        <SheetDescription>Career Roadmap & Pivots</SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <ScrollArea className="flex-1 p-6">
                                <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-1">
                                        <MapPin className="h-4 w-4" /> Strategic Pivot
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{selectedStream.pivot}</p>
                                </div>

                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" /> The Path Forward
                                </h3>

                                <InteractiveRoadmap
                                    streamId={selectedStream.id}
                                    data={getRoadmapData(selectedStream.id)}
                                />
                            </ScrollArea>

                            <div className="p-6 border-t bg-muted/10">
                                <Button className="w-full" onClick={() => setIsSheetOpen(false)}>
                                    Close Visualization
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
