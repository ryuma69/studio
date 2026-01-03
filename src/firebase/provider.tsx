'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, type ReactNode, useState, useEffect } from 'react';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
}

export function useAuth() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
}

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setIsUserLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsUserLoading(false);
      setUser(null);
    }
  }, [auth]);

  return { user, isUserLoading };
}
