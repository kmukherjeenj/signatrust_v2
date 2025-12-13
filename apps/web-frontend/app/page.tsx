'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button, Spinner } from '@/components/ui';

type SignerInput = {
  phone: string;
  email: string;
};

type CreatedSession = {
  sessionId: string;
  documentId: string;
  signers: Array<{
    id: string;
    email?: string;
    phone?: string;
    token: string;
    signingUrl: string;
  }>;
};

/**
 * Compute SHA-256 hash of a file in the browser
 */
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [documentSize, setDocumentSize] = useState(0);
  const [isHashing, setIsHashing] = useState(false);
  const [signers, setSigners] = useState<SignerInput[]>([{ phone: '', email: '' }]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAuthenticated = status === 'authenticated';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setError(null);
    setIsHashing(true);

    try {
      // Compute hash client-side
      const hash = await computeFileHash(file);
      setDocumentHash(hash);
      setDocumentSize(file.size);

      // Auto-fill document name if empty
      if (!documentName) {
        const name = file.name.replace(/\.pdf$/i, '');
        setDocumentName(name);
      }
    } catch (err) {
      setError('Failed to process file');
      console.error('Hash error:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const addSigner = () => {
    setSigners([...signers, { phone: '', email: '' }]);
  };

  const removeSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index));
    }
  };

  const updateSignerPhone = (index: number, phone: string) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], phone };
    setSigners(updated);
  };

  const updateSignerEmail = (index: number, email: string) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], email };
    setSigners(updated);
  };

  const createSession = async () => {
    setError(null);

    // Validate document
    if (!documentHash) {
      setError('Please select a PDF file to compute its hash');
      return;
    }

    if (!documentUrl.trim()) {
      setError('Please enter the shareable URL where your document is hosted');
      return;
    }

    // Validate URL format
    try {
      new URL(documentUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://drive.google.com/...)');
      return;
    }

    if (!documentName.trim()) {
      setError('Please enter a document name');
      return;
    }

    // Each signer needs at least phone or email
    const validSigners = signers.filter(s => s.phone.trim() || s.email.trim());
    if (validSigners.length === 0) {
      setError('Please add at least one signer with a phone number or email');
      return;
    }

    // Validate formats
    const phoneRegex = /^[\d\s\-+()]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const signer of validSigners) {
      if (signer.phone.trim() && !phoneRegex.test(signer.phone)) {
        setError(`Invalid phone format: ${signer.phone}`);
        return;
      }
      if (signer.email.trim() && !emailRegex.test(signer.email)) {
        setError(`Invalid email format: ${signer.email}`);
        return;
      }
    }

    setCreating(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: documentName.trim(),
          documentHash: documentHash,
          documentUrl: documentUrl.trim(),
          documentMimeType: 'application/pdf',
          documentSize: documentSize,
          creatorId: 'demo-user',
          signers: validSigners.map((s, i) => ({
            phone: s.phone.trim() || undefined,
            email: s.email.trim() || undefined,
            orderIndex: i,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await response.json();
      setCreatedSession(data);
      toast.success('Signing session created!');
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to create signing session';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const copyHash = async () => {
    await copyToClipboard(documentHash, -1);
  };

  const resetForm = () => {
    setCreatedSession(null);
    setDocumentName('');
    setDocumentUrl('');
    setDocumentHash('');
    setDocumentSize(0);
    setSigners([{ phone: '', email: '' }]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (createdSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
              <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
            </div>
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-6">
            <div className="mb-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 mb-4">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-2">Signing Session Created!</h1>
              <p className="text-zinc-400">
                Share the signing links below with your signers
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-zinc-500 mb-1">Document Hash (SHA-256)</div>
                <div className="font-mono text-xs text-zinc-300 break-all">
                  {documentHash}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-zinc-300">Signing Links</div>
                {createdSession.signers.map((signer, index) => (
                  <div
                    key={signer.id}
                    className="rounded-lg border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {signer.phone && (
                          <span className="inline-flex items-center gap-1 text-sm text-zinc-300">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {signer.phone}
                          </span>
                        )}
                        {signer.email && !signer.phone && (
                          <span className="text-sm text-zinc-300">{signer.email}</span>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(signer.signingUrl, index)}
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        {copiedIndex === index ? (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-zinc-500 break-all">
                      {signer.signingUrl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Hash recorded on Solana blockchain
              </div>
              <button
                onClick={resetForm}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-zinc-400">{session?.user?.email}</span>
                <Link href="/dashboard" className="text-sm text-emerald-400 hover:text-emerald-300">
                  Dashboard
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-sm text-emerald-400 hover:text-emerald-300">
                Sign In
              </Link>
            )}
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-6">
          <h1 className="text-2xl font-semibold mb-2">Create Signing Session</h1>
          <p className="text-zinc-400 mb-6">
            Set up a document for secure, blockchain-verified signing
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Document Upload for Hash */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Document (PDF)
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Select your PDF to compute its hash. The file stays in your browser - we never store it.
              </p>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-dashed border-white/20 bg-black/20 px-4 py-8 text-sm text-zinc-400 hover:border-emerald-500/50 hover:bg-black/30 cursor-pointer transition-colors"
                >
                  {isHashing ? (
                    <>
                      <Spinner size="md" />
                      Computing hash...
                    </>
                  ) : documentHash ? (
                    <>
                      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-400">PDF processed - hash computed</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Click to select PDF file
                    </>
                  )}
                </label>
              </div>
              {documentHash && (
                <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">SHA-256 Hash</span>
                    <button
                      onClick={copyHash}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      {copiedIndex === -1 ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-zinc-400 break-all">
                    {documentHash}
                  </div>
                </div>
              )}
            </div>

            {/* Document URL */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Document URL
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Shareable link to your document (Google Drive, Dropbox, etc.)
              </p>
              <input
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Make sure the link is accessible to all signers (set sharing to "Anyone with the link")
              </p>
            </div>

            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Document Name
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Employment Contract"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            {/* Signers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300">
                  Signers
                </label>
                <button
                  onClick={addSigner}
                  className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Signer
                </button>
              </div>

              <div className="space-y-4">
                {signers.map((signer, index) => (
                  <div key={index} className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-zinc-500">Signer {index + 1}</span>
                      {signers.length > 1 && (
                        <button
                          onClick={() => removeSigner(index)}
                          className="text-xs text-zinc-400 hover:text-red-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Phone Number (for SMS magic link)
                        </label>
                        <input
                          type="tel"
                          value={signer.phone}
                          onChange={(e) => updateSignerPhone(index, e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Email (optional fallback)
                        </label>
                        <input
                          type="email"
                          value={signer.email}
                          onChange={(e) => updateSignerEmail(index, e.target.value)}
                          placeholder="signer@example.com"
                          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={createSession}
              disabled={isHashing}
              loading={creating}
              size="lg"
              className="w-full"
            >
              Create Signing Session
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                No document storage
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Hash on blockchain
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Solana powered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
