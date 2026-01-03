'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { firebaseApp, auth, firestore } from './firebase'; // Import from the new dedicated file

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
