// apps/web-frontend/global.d.ts
declare module '*.css';
declare module '*.module.css';

// Any import ending with ?url returns a string URL
declare module '*?url' {
  const url: string;
  export default url;
}

// Shim legacy runtime types (TS-only)
declare module 'pdfjs-dist/legacy/build/pdf' {
  export const getDocument: any;
  export const GlobalWorkerOptions: any;
}

// USE THE ACTUAL FILE NAME (.mjs), not .js
declare module 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url' {
  const url: string;
  export default url;
}
