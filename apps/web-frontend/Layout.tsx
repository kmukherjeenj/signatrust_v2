// apps/web-frontend/app/layout.tsx
import './globals.css';
import 'pdfjs-dist/web/pdf_viewer.css'; // ← import here (global CSS is allowed here)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
