'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgb(24 24 27)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgb(244 244 245)',
          },
        }}
      />
    </SessionProvider>
  );
}
