'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, initiateGoogleSignIn } from '@/firebase'; // Simplified and corrected import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Loader2 } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await initiateGoogleSignIn(auth);
      if (userCredential.user) {
        router.push('/quiz');
      } else {
        throw new Error("Sign in did not return a user.");
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setIsLoading(false);
    }
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
          {!isMounted ? (
            <div className="flex justify-center items-center h-36">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? 'Starting...' : 'Sign in with Google'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
