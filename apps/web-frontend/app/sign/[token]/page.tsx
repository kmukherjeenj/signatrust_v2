'use client';

import { useEffect, useRef, useState, use } from 'react';

type SessionData = {
  id: string;
  status: string;
  document: { url?: string; src?: string; name?: string; mimeType?: string; hash?: string };
  signers: Array<{ id: string; email?: string; status: string; orderIndex?: number }>;
  sequentialSigning?: boolean;
  currentSignerPosition?: number | null;
  canSign?: boolean;
  waitingMessage?: string | null;
};

/**
 * Compute SHA-256 hash of a file in the browser (for verification)
 */
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docName, setDocName] = useState<string>('Document');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'cancelled' | 'expired' | 'invalidated' | 'generic' | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [allSigned, setAllSigned] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'match' | 'mismatch' | null>(null);

  const token = resolvedParams.token;

  // Fetch session → PDF URL
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) throw new Error('no token');
        const res = await fetch(`/api/session-by-token?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `session-by-token ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setSession(data);
          const url: string | null = data?.document?.url ?? data?.document?.src ?? null;
          if (!url) throw new Error('missing pdf url');
          setPdfUrl(url);
          setDocName(data?.document?.name ?? 'Document');
        }
      } catch (e: any) {
        if (!cancelled) {
          const errorMsg = e.message?.toLowerCase() || '';
          if (errorMsg === 'already_used') {
            setError('This signing link has already been used.');
            setErrorType('invalidated');
          } else if (errorMsg === 'session_cancelled' || errorMsg.includes('cancelled')) {
            setError('This signing session has been cancelled by the sender.');
            setErrorType('cancelled');
          } else if (errorMsg === 'session_expired' || errorMsg.includes('session has expired')) {
            setError('This signing session has expired. The deadline has passed.');
            setErrorType('expired');
          } else if (errorMsg === 'token_invalidated' || errorMsg.includes('invalidated')) {
            setError('This signing link is no longer valid. A new invite may have been sent.');
            setErrorType('invalidated');
          } else if (errorMsg === 'expired' || errorMsg.includes('token') && errorMsg.includes('expired')) {
            setError('This signing link has expired.');
            setErrorType('expired');
          } else {
            setError('Invalid or expired link.');
            setErrorType('generic');
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // Set PDF ready when URL is available
  useEffect(() => {
    if (pdfUrl) {
      setPdfReady(true);
    }
  }, [pdfUrl]);

  // Initialize signature canvas
  useEffect(() => {
    if (!showSignModal || !sigCanvasRef.current) return;
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [showSignModal]);

  // Signature drawing handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submitSignature = async () => {
    if (!session || !sigCanvasRef.current) return;

    setSubmitting(true);
    try {
      const imageDataUrl = sigCanvasRef.current.toDataURL('image/png');

      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          signerToken: token,
          signaturePayload: { imageDataUrl },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Handle sequential signing order error
        if (data.error === 'sequential_signing_order') {
          setError(`You cannot sign yet. Please wait for signer #${data.waitingForPosition} to complete first.`);
          setShowSignModal(false);
          return;
        }
        throw new Error(data.error || 'Failed to submit signature');
      }

      const data = await res.json();
      setSigned(true);
      setAllSigned(data.allSigned || false);
      setShowSignModal(false);
    } catch (e: any) {
      setError(e.message || 'Failed to submit signature');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.document?.hash) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const computedHash = await computeFileHash(file);
      const matches = computedHash.toLowerCase() === session.document.hash.toLowerCase();
      setVerificationResult(matches ? 'match' : 'mismatch');
    } catch (err) {
      setError('Failed to verify file');
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Document Signed!</h1>
          <p className="text-zinc-400 mb-4">
            {allSigned
              ? 'All parties have signed. The document is now complete and recorded on the blockchain.'
              : 'Your signature has been recorded. Waiting for other signers to complete.'}
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-300">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secured on Solana blockchain
          </div>
        </div>
      </div>
    );
  }

  // Show dedicated error page for session-level errors
  if (errorType && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            {errorType === 'cancelled' ? (
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : errorType === 'expired' ? (
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : errorType === 'invalidated' ? (
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-500/20">
                <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
            ) : (
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-500/20">
                <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-semibold mb-2">
            {errorType === 'cancelled' ? 'Session Cancelled' :
             errorType === 'expired' ? 'Session Expired' :
             errorType === 'invalidated' ? 'Link No Longer Valid' :
             'Unable to Load'}
          </h1>

          <p className="text-zinc-400 mb-6">{error}</p>

          {errorType === 'invalidated' && (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 mb-6">
              <p className="text-sm text-cyan-300">
                If you received a new invitation link, please use that one instead.
              </p>
            </div>
          )}

          {errorType === 'cancelled' && (
            <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 px-4 py-3 mb-6">
              <p className="text-sm text-zinc-400">
                The sender has cancelled this signing request. Contact them if you have questions.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
            <span className="font-semibold tracking-tight text-lg">SignaTrust</span>
          </div>
          <span className="text-sm text-zinc-400">secure • verifiable • on-chain</span>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">{docName}</h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Sequential signing warning */}
          {session?.sequentialSigning && session?.canSign === false && session?.waitingMessage && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Sequential Signing Enabled</span>
              </div>
              <p className="text-sm text-amber-300/80">{session.waitingMessage}</p>
              {session.currentSignerPosition && (
                <p className="text-xs text-amber-400/60 mt-1">
                  You are signer #{session.currentSignerPosition} in the signing order.
                </p>
              )}
            </div>
          )}

          <div className="rounded-lg border border-white/10 overflow-hidden bg-black/30">
            {pdfUrl ? (
              <iframe
                src={pdfUrl.startsWith('http') ? `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}` : pdfUrl}
                className="w-full h-[600px] bg-white"
                title="Document Preview"
              />
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center text-zinc-500">
                Loading document...
              </div>
            )}
          </div>

          {/* Document Hash & Verification */}
          {session?.document?.hash && (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm text-zinc-300">Document Hash (SHA-256)</span>
                </div>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Verify
                </button>
              </div>
              <div className="font-mono text-xs text-zinc-500 break-all">
                {session.document.hash}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                This hash uniquely identifies the document and is recorded on Solana blockchain
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              {!pdfReady ? 'Loading…' :
               session?.canSign === false ? 'Waiting for previous signer(s)' :
               'Ready to sign'}
            </div>
            <button
              onClick={() => setShowSignModal(true)}
              disabled={!pdfReady || session?.canSign === false}
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {session?.canSign === false ? 'Waiting...' : 'Sign Document'}
            </button>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Draw Your Signature</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Use your mouse or finger to draw your signature below.
            </p>

            <div className="rounded-lg border border-white/10 overflow-hidden mb-4">
              <canvas
                ref={sigCanvasRef}
                width={460}
                height={200}
                className="block w-full bg-white cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={clearSignature}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSignature}
                  disabled={!hasSignature || submitting}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Signature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Verify Document</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Upload your copy of the PDF to verify it matches the document being signed.
              The hash will be computed locally in your browser.
            </p>

            {verificationResult === 'match' && (
              <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Document Verified!</span>
                </div>
                <p className="mt-1 text-sm text-emerald-300/80">
                  The document matches the hash on blockchain.
                </p>
              </div>
            )}

            {verificationResult === 'mismatch' && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                <div className="flex items-center gap-2 text-red-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium">Hash Mismatch!</span>
                </div>
                <p className="mt-1 text-sm text-red-300/80">
                  The uploaded file does not match. Do not sign if this is unexpected.
                </p>
              </div>
            )}

            <div className="mb-4">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleVerifyFile}
                className="hidden"
                id="verify-file-upload"
              />
              <label
                htmlFor="verify-file-upload"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-dashed border-white/20 bg-black/20 px-4 py-8 text-sm text-zinc-400 hover:border-emerald-500/50 hover:bg-black/30 cursor-pointer transition-colors"
              >
                {verifying ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Select PDF to verify
                  </>
                )}
              </label>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 p-3 mb-4">
              <div className="text-xs text-zinc-500 mb-1">Expected Hash</div>
              <div className="font-mono text-xs text-zinc-400 break-all">
                {session?.document?.hash}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerificationResult(null);
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
