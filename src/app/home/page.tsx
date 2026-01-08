'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
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
import { Brain, Map, LineChart, ArrowRight, Sparkles, User, LogOut, Settings, Edit } from 'lucide-react';

export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    const handleSignOut = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
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
                        <Button
                            size="lg"
                            className="text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                            onClick={() => router.push('/aptitude-test')}
                        >
                            <Brain className="mr-2 h-6 w-6" />
                            Start Aptitude Analysis
                        </Button>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="grid md:grid-cols-2 gap-6">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                        <CardHeader>
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
                        <CardContent className="h-24 flex items-center justify-center text-muted-foreground text-sm italic border-t bg-muted/20">
                            Feature coming soon
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full group-hover:text-primary justify-between" disabled>
                                Explore Paths <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
                        onClick={() => router.push('/dashboard')}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform">
                                    <LineChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                Check Results
                            </CardTitle>
                            <CardDescription>
                                View your aptitude analysis scores and AI recommendations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-24 flex items-center justify-center text-muted-foreground text-sm border-t bg-muted/20">
                            View detailed reports from database
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full group-hover:text-primary justify-between">
                                View Dashboard <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </main>
    );
}
