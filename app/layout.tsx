// C:\Source\signatrust\app\layout.tsx
'use client';

import React, { useEffect } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { log, logError } from './utils/client_logger';
import ErrorBoundary from './components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

/*export const metadata: Metadata = {
  title: 'SignaTrust - Secure Digital Signatures with Blockchain & zkProofs',
  description: 'Experience the most secure and scalable digital signature solution on the market',
  keywords: ['verasmo', 'digital signature', 'blockchain', 'zkProofs'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}; */

function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    log('info', 'Application started');

    const handleError = (event: ErrorEvent) => {
      logError(event.error, 'Unhandled error in application');
      console.error('Unhandled error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(event.reason, 'Unhandled promise rejection');
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      log('info', 'Application shutting down');
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

export default function RootLayoutWrapper(props: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong at the root level. Please refresh the page.</div>}>
      <RootLayout {...props} />
    </ErrorBoundary>
  );
}