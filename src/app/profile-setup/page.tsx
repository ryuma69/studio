'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Check,
    ArrowRight,
    User,
    BookOpen,
    Heart,
    Globe,
    Code,
    Zap,
    Music,
    Dumbbell,
    Palette,
    Gamepad2,
    Plane,
    Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INTERESTS = [
    { id: 'science', label: 'Science', icon: Zap },
    { id: 'arts', label: 'Arts & Design', icon: Palette },
    { id: 'tech', label: 'Technology', icon: Code },
    { id: 'sports', label: 'Sports', icon: Dumbbell },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'reading', label: 'Reading', icon: BookOpen },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'global', label: 'Global Affairs', icon: Globe },
];

export default function ProfileSetupPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        interests: [] as string[],
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, gender: value }));
    };

    const toggleInterest = (interestId: string) => {
        setFormData((prev) => {
            const interests = prev.interests.includes(interestId)
                ? prev.interests.filter((id) => id !== interestId)
                : [...prev.interests, interestId];
            return { ...prev, interests };
        });
    };

    const handleContinue = async () => {
        if (step === 1) {
            if (formData.name && formData.age && formData.gender) {
                setStep(2);
            }
        } else {
            // Submit form
            if (user && firestore) {
                try {
                    await setDoc(doc(firestore, 'users', user.uid), {
                        profile: {
                            ...formData,
                            updatedAt: new Date().toISOString(),
                        }
                    }, { merge: true });
                    console.log('Profile saved');
                    router.push('/interest-profile');
                } catch (error) {
                    console.error('Error saving profile:', error);
                    // Optionally handle error state here
                }
            }
        }
    };

    const isStep1Valid = formData.name.trim() !== '' && formData.age !== '' && formData.gender !== '';

    if (isUserLoading) {
        return (
            <main className="flex min-h-screen w-full items-center justify-center bg-background">
                <div className="animate-pulse text-primary">Loading...</div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 animate-in fade-in duration-500">
            <Card className="w-full max-w-lg shadow-2xl border-primary/20">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                        <User className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary">
                        {step === 1 ? 'Tell us about yourself' : 'What do you like?'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                        {step === 1
                            ? 'We need a few details to personalize your experience.'
                            : 'Select topics that interest you to help us guide you better.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-2">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="h-11 text-base"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-base">Age</Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            placeholder="Age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            className="h-11 text-base bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-base">Gender</Label>
                                        <Select onValueChange={handleSelectChange} value={formData.gender}>
                                            <SelectTrigger className="h-11 text-base">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {INTERESTS.map((interest) => {
                                    const Icon = interest.icon;
                                    const isSelected = formData.interests.includes(interest.id);
                                    return (
                                        <div
                                            key={interest.id}
                                            onClick={() => toggleInterest(interest.id)}
                                            className={cn(
                                                "cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
                                                isSelected
                                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                                    : "border-muted bg-card text-muted-foreground"
                                            )}
                                        >
                                            <Icon className={cn("h-6 w-6", isSelected && "text-primary fill-primary/20")} />
                                            <span className="text-sm text-center line-clamp-1">{interest.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                    {step === 2 && (
                        <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground">
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={handleContinue}
                        className={cn("mk-4", step === 1 ? "w-full" : "ml-auto")}
                        size="lg"
                        disabled={step === 1 ? !isStep1Valid : false}
                    >
                        {step === 1 ? 'Continue' : 'Start Assessment'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
