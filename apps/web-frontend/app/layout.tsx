// apps/web-frontend/app/layout.tsx
import './globals.css';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'SignaTrust - Blockchain Document Signing',
  description: 'Secure, decentralized document signing with Solana blockchain verification',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-900 text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
