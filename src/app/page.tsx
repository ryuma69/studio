'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, initiateGoogleSignIn, useFirestore } from '@/firebase'; // Simplified and corrected import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkProfileAndRedirect = async (uid: string) => {
    if (!firestore) return;
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        router.push('/home');
      } else {
        router.push('/profile-setup');
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      router.push('/profile-setup');
    }
  };

  const handleAction = async () => {
    setIsLoading(true);
    if (user) {
      await checkProfileAndRedirect(user.uid);
      return;
    }

    if (!auth) {
      console.error("Auth is not ready yet.");
      return;
    }

    try {
      const userCredential = await initiateGoogleSignIn(auth);
      if (userCredential.user) {
        await checkProfileAndRedirect(userCredential.user.uid);
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
          {!isMounted || isUserLoading ? (
            <div className="flex justify-center items-center h-36">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={handleAction} disabled={isLoading || !auth} className="w-full" size="lg">
                {isLoading ? 'Starting...' : user ? `Continue as ${user.displayName}` : 'Sign in with Google'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
