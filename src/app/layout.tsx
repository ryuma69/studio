import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase'; // Corrected import path

export const metadata: Metadata = {
  title: '10th Grade Career Compass',
  description: 'Find your path after 10th grade with AI-powered guidance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: 'var(--font-body)' }} className="antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
