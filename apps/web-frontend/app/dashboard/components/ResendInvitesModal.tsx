'use client';

import { useState } from 'react';

interface Signer {
  id: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  resendCount: number;
  lastResendAt?: string | null;
}

interface ResendInvitesModalProps {
  sessionId: string;
  documentName: string;
  signers: Signer[];
  onClose: () => void;
  onResent: () => void;
}

const MAX_RESENDS = 5;

export function ResendInvitesModal({
  sessionId,
  documentName,
  signers,
  onClose,
  onResent,
}: ResendInvitesModalProps) {
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { success: boolean; error?: string }>>({});

  const pendingSigners = signers.filter((s) => s.status === 'pending');

  const handleResend = async (signerId: string) => {
    setSubmitting((prev) => ({ ...prev, [signerId]: true }));

    try {
      const res = await fetch(`/api/sessions/${sessionId}/signers/${signerId}/resend`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setResults((prev) => ({
          ...prev,
          [signerId]: { success: false, error: data.message || data.error },
        }));
      } else {
        setResults((prev) => ({ ...prev, [signerId]: { success: true } }));
        onResent();
      }
    } catch (e: any) {
      setResults((prev) => ({
        ...prev,
        [signerId]: { success: false, error: 'Network error' },
      }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [signerId]: false }));
    }
  };

  const handleResendAll = async () => {
    for (const signer of pendingSigners) {
      if (signer.resendCount < MAX_RESENDS && !submitting[signer.id]) {
        await handleResend(signer.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold mb-2">Resend Invites</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Resend signing invitations for <strong className="text-white">{documentName}</strong>.
          Old links will be invalidated.
        </p>

        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {pendingSigners.length === 0 ? (
            <div className="text-center text-zinc-500 py-4">
              All signers have already signed
            </div>
          ) : (
            pendingSigners.map((signer) => {
              const contact = signer.phone || signer.email || 'Unknown';
              const canResend = signer.resendCount < MAX_RESENDS;
              const result = results[signer.id];

              return (
                <div
                  key={signer.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
                >
                  <div>
                    <div className="text-sm text-white">{contact}</div>
                    <div className="text-xs text-zinc-500">
                      {signer.resendCount}/{MAX_RESENDS} resends used
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result?.success && (
                      <span className="text-xs text-emerald-400">Sent!</span>
                    )}
                    {result?.error && (
                      <span className="text-xs text-red-400">{result.error}</span>
                    )}
                    <button
                      onClick={() => handleResend(signer.id)}
                      disabled={!canResend || submitting[signer.id]}
                      className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-medium text-black disabled:opacity-50 hover:bg-cyan-400"
                    >
                      {submitting[signer.id] ? 'Sending...' : 'Resend'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between border-t border-white/10 pt-4">
          {pendingSigners.length > 0 && (
            <button
              onClick={handleResendAll}
              disabled={pendingSigners.every((s) => s.resendCount >= MAX_RESENDS)}
              className="text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
            >
              Resend All
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
