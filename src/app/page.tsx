'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, initiateAnonymousSignIn } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Compass, User as UserIcon } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleStart = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name to begin.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Set up a listener that will run once.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // We only want this to run once, so we unsubscribe immediately.
      unsubscribe();

      if (user) {
        // User is signed in.
        try {
          await updateProfile(user, {
            displayName: name,
          });
          toast({
            title: `Welcome, ${name}!`,
            description: 'Your anonymous session has started.',
          });
          router.push('/quiz');
        } catch (error) {
            console.error('Update profile failed:', error);
            toast({
                title: 'Update Failed',
                description: 'Could not save your name. Please try again.',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
        // Don't set loading to false here, as we are navigating away.
      } else {
        // User is signed out or sign-in failed.
        console.error('Anonymous sign-in failed.');
        toast({
            title: 'Authentication Failed',
            description: 'Could not start your session. Please try again.',
            variant: 'destructive',
        });
        setIsLoading(false);
      }
    }, (error) => {
        // This callback handles errors during the listener setup.
        unsubscribe();
        console.error('onAuthStateChanged error:', error);
        toast({
            title: 'Authentication Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
        setIsLoading(false);
    });

    // Initiate the sign-in process. The listener above will catch the result.
    initiateAnonymousSignIn(auth);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">10th Grade Career Compass</CardTitle>
          <CardDescription className="text-muted-foreground">
            Confused about what to do after 10th? Let's find the right path for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  className="pl-10"
                  aria-label="Full Name"
                />
              </div>
            </div>
            <Button onClick={handleStart} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Starting...' : 'Start Your Journey'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
