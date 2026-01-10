'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, initiateGoogleSignIn, useFirestore } from '@/firebase'; // Simplified and corrected import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/spotlight-card';



export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
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
    <AuroraBackground>
      <div className="relative flex flex-col items-center justify-center p-4">
        {showIntro ? (
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex flex-col gap-4 items-center justify-center px-4"
          >
            <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
              Vidhya Sarathi
            </div>
            <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 text-center">
              Discover your true potential and find your right path.
            </div>
            <button
              onClick={() => setShowIntro(false)}
              className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-10 py-4 hover:opacity-80 transition-opacity"
            >
              Get Started
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="w-full shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-0">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Compass className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-bold text-primary">Vidhya Sarathi</CardTitle>
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
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}
