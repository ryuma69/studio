'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Map, LineChart, ArrowRight, Sparkles, User, LogOut, Settings, Edit, FileText, ChevronLeft, Calendar } from 'lucide-react';
import DetailedReportChart from '@/components/detailed-report-chart';
import html2canvas from 'html2canvas';
import { GlowCard } from '@/components/ui/spotlight-card';
import { MagneticButton } from '@/components/ui/magnetic-button';


type ReportData = {
    id: string;
    stream: string;
    generatedAt: string;
    report: any; // Using simplified type for now, strictly matches DetailedReportOutput
};

export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Reports State
    const [reports, setReports] = useState<ReportData[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [isReportsListOpen, setIsReportsListOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

    const handleExplorePaths = async () => {
        // Just navigate to the dedicated career paths page. 
        // Data loading is handled there.
        router.push('/career-paths');
    };

    const handleDownloadReport = () => {
        const chartElement = document.getElementById('report-chart-container');
        if (!chartElement) {
            console.error("Chart element not found");
            return;
        }

        html2canvas(chartElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `career-report-${selectedReport?.stream || 'summary'}.png`;
            link.click();
        });
    };

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    // Fetch Reports
    useEffect(() => {
        const fetchReports = async () => {
            if (!user || !firestore) return;

            try {
                const reportsRef = collection(firestore, 'users', user.uid, 'reports');
                const q = query(reportsRef, orderBy('generatedAt', 'desc'));
                const snapshot = await getDocs(q);

                const fetchedReports = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ReportData[];

                setReports(fetchedReports);
            } catch (err) {
                console.error("Error fetching reports:", err);
            } finally {
                setIsLoadingReports(false);
            }
        };

        if (user) {
            fetchReports();
        }
    }, [user, firestore]);

    const handleSignOut = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isUserLoading) {
        return null; // Or a loading spinner
    }

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-500 relative">
            {/* Profile Button (Top Right) */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 border-primary/20 shadow-sm hover:shadow-md">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                                <AvatarFallback className="bg-primary/5 text-primary">
                                    <User className="h-6 w-6" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>My Profile</DialogTitle>
                            <DialogDescription>
                                Manage your account settings and preferences.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4 py-4">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarImage src={user?.photoURL || undefined} />
                                <AvatarFallback className="text-2xl bg-muted"><User className="h-12 w-12" /></AvatarFallback>
                            </Avatar>
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-semibold">{user?.displayName || 'Career Explorer'}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/profile-setup')}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile Details
                            </Button>
                            <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="max-w-5xl mx-auto space-y-12 pt-8">
                {/* Hero Section */}
                <section className="text-center space-y-6 py-12">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
                        Vidhya Sarathi
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your AI-powered companion for navigating life after 10th grade. Discover your strengths, explore career paths, and find the future that fits you best.
                    </p>

                    <div className="pt-4">
                        <MagneticButton>
                            <Button
                                size="lg"
                                className="text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                                onClick={() => router.push('/aptitude-test')}
                            >
                                <Brain className="mr-2 h-6 w-6" />
                                Start Aptitude Analysis
                            </Button>
                        </MagneticButton>
                    </div>
                </section>

                {/* Features Grid */}
                {/* Features Grid */}
                <section className="grid md:grid-cols-2 gap-6">
                    <GlowCard
                        className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md"
                        onClick={handleExplorePaths}
                        customSize
                        glowColor="blue"
                    >
                        <CardHeader className="relative z-10">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                Career Path Visualization
                            </CardTitle>
                            <CardDescription>
                                Explore interactive roadmaps for different streams and careers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-24 flex items-center justify-center text-muted-foreground text-sm italic border-t bg-muted/20 relative z-10">
                            See detailed roadmaps
                        </CardContent>
                        <CardFooter className="relative z-10">
                            <div className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-between cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground rounded-xl")}>
                                Explore Paths <ArrowRight className="h-4 w-4" />
                            </div>
                        </CardFooter>
                    </GlowCard>

                    <Dialog open={isReportsListOpen} onOpenChange={setIsReportsListOpen}>
                        <DialogTrigger asChild>
                            {/* We need a wrapping div or forwardRef for DialogTrigger if GlowCard doesn't forward ref properly, 
                                but standard DialogTrigger asChild expects a single child. GlowCard is a functional component.
                                Let's assume standard behavior. If it breaks, I'll wrap in div. 
                                Actually, looking at GlowCard definition, it uses inner refs but doesn't strictly forwardRef to the outer div. 
                                DialogTrigger asChild requires the child to accept a ref. 
                                SAFEST BET: Wrap GlowCard in a div? No, DialogTrigger asChild clones the element and passes props. 
                                If GlowCard doesn't forward ref, Trigger won't work perfectly for keyboard nav/focus.
                                HOWEVER, for now, let's wrap it in a plain <div> and *not* use asChild on Trigger, 
                                OR modify GlowCard to forward ref.
                                Modifying GlowCard is better but I will try wrapping in a <div> inside standard Trigger (without asChild) first? 
                                No, DialogTrigger acts as a button by default. 
                                Let's assume I can change DialogTrigger to NOT use asChild and just wrap the GlowCard. 
                                -> <DialogTrigger><GlowCard.../></DialogTrigger> : This renders a button wrapping a div (GlowCard). Valid HTML but questionable semantics.
                                -> Better: Use standard <div> with onClick to open dialog?
                                -> No, wait, existing code uses `DialogTrigger asChild`.
                                -> Let's check GlowCard again. It has `ref={cardRef}`. It does NOT use `forwardRef`.
                                -> I will duplicate functionality: onClick={() => setIsReportsListOpen(true)} on the GlowCard and remove DialogTrigger wrapper for the card itself, 
                                   controlling the Dialog via `open={isReportsListOpen}` which is already there!
                            */}
                            <div className="w-full h-full" onClick={() => setIsReportsListOpen(true)}>
                                <GlowCard
                                    className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md h-full"
                                    customSize
                                    glowColor="green"
                                >
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                                <LineChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            Check Results
                                        </CardTitle>
                                        <CardDescription>
                                            View your existing detailed career reports.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-24 flex items-center justify-center text-sm border-t bg-muted/20 relative z-10">
                                        {isLoadingReports ? (
                                            <span className="text-muted-foreground">Loading reports...</span>
                                        ) : reports.length > 0 ? (
                                            <span className="text-primary font-medium">{reports.length} Reports Available</span>
                                        ) : (
                                            <span className="text-muted-foreground">No reports generated yet</span>
                                        )}
                                    </CardContent>
                                    <CardFooter className="relative z-10">
                                        <div className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-between cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground rounded-xl")}>
                                            Show Results <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </CardFooter>
                                </GlowCard>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
                            {!selectedReport ? (
                                // LIST VIEW
                                <div className="flex flex-col h-full">
                                    <DialogHeader className="p-6 pb-2">
                                        <DialogTitle className="text-2xl">Your Benefit Reports</DialogTitle>
                                        <DialogDescription>
                                            Select a generated report to view detailed insights.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
                                        {isLoadingReports && <div className="text-center py-10">Loading...</div>}
                                        {!isLoadingReports && reports.length === 0 && (
                                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                                No detailed reports found. <br />
                                                <Button variant="link" onClick={() => router.push('/aptitude-test')}>Take the test to generate one.</Button>
                                            </div>
                                        )}
                                        {reports.map((report) => (
                                            <div
                                                key={report.id}
                                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-primary/10 p-3 rounded-md">
                                                        <FileText className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{report.stream}</h4>
                                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(report.generatedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <DialogFooter className="p-6 border-t bg-muted/10">
                                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                            Go to Full Dashboard
                                        </Button>
                                    </DialogFooter>
                                </div>
                            ) : (
                                // DETAIL VIEW
                                <div className="flex flex-col h-full overflow-hidden">
                                    {/* Accessibility Title */}
                                    <DialogTitle className="sr-only">Report for {selectedReport.stream}</DialogTitle>

                                    <div className="p-4 border-b flex items-center gap-2 bg-muted/10">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                                            <ChevronLeft className="mr-1 h-4 w-4" /> Back
                                        </Button>
                                        <div className="h-6 w-px bg-border mx-2" />
                                        <DialogTitle className="font-semibold text-base">Report for {selectedReport.stream}</DialogTitle>
                                        <span className="ml-auto text-xs text-muted-foreground">{formatDate(selectedReport.generatedAt)}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                        {/* Reuse the Dashboard Report UI structure */}
                                        <div className="max-w-3xl mx-auto space-y-8 pb-8">
                                            <div className="flex justify-center bg-white p-6 rounded-xl border shadow-sm">
                                                <DetailedReportChart data={selectedReport.report.aptitudeScores} onDownload={handleDownloadReport} />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                                    <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                                                        <Sparkles className="h-5 w-5" /> Key Strengths
                                                    </h3>
                                                    <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">{selectedReport.report.strengths}</p>
                                                </div>

                                                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-lg border border-green-100 dark:border-green-900/20">
                                                    <h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                                                        <Map className="h-5 w-5" /> Suitability Analysis
                                                    </h3>
                                                    <p className="text-sm leading-relaxed text-green-900 dark:text-green-100">{selectedReport.report.suitability}</p>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                                <h3 className="font-semibold text-lg text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                                                    <Brain className="h-5 w-5" /> Future Career Opportunities
                                                </h3>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {selectedReport.report.jobProspects?.map((job: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2 text-sm bg-background/80 p-3 rounded shadow-sm">
                                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                                                            {job}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </section>
            </div>
        </main>
    );
}
