'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Button } from '@/components/ui';

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

  const handleResend = async (signerId: string, contact: string) => {
    setSubmitting((prev) => ({ ...prev, [signerId]: true }));

    try {
      const res = await fetch(`/api/sessions/${sessionId}/signers/${signerId}/resend`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || data.error || 'Failed to resend';
        setResults((prev) => ({
          ...prev,
          [signerId]: { success: false, error: errorMsg },
        }));
        toast.error(`Failed to resend to ${contact}`);
      } else {
        setResults((prev) => ({ ...prev, [signerId]: { success: true } }));
        toast.success(`Invite resent to ${contact}`);
        onResent();
      }
    } catch (e: any) {
      setResults((prev) => ({
        ...prev,
        [signerId]: { success: false, error: 'Network error' },
      }));
      toast.error('Network error');
    } finally {
      setSubmitting((prev) => ({ ...prev, [signerId]: false }));
    }
  };

  const handleResendAll = async () => {
    for (const signer of pendingSigners) {
      const contact = signer.phone || signer.email || 'Unknown';
      if (signer.resendCount < MAX_RESENDS && !submitting[signer.id]) {
        await handleResend(signer.id, contact);
      }
    }
  };

  return (
    <Modal open={true} onClose={onClose} size="lg" title="Resend Invites">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3 gap-2"
              >
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{contact}</div>
                  <div className="text-xs text-zinc-500">
                    {signer.resendCount}/{MAX_RESENDS} resends used
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {result?.success && (
                    <span className="text-xs text-emerald-400">Sent!</span>
                  )}
                  {result?.error && (
                    <span className="text-xs text-red-400 truncate max-w-[100px]">{result.error}</span>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleResend(signer.id, contact)}
                    disabled={!canResend}
                    loading={submitting[signer.id]}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between border-t border-white/10 pt-4 gap-2">
        {pendingSigners.length > 0 && (
          <Button
            variant="ghost"
            onClick={handleResendAll}
            disabled={pendingSigners.every((s) => s.resendCount >= MAX_RESENDS)}
          >
            Resend All
          </Button>
        )}
        <Button variant="secondary" onClick={onClose} className="sm:ml-auto">
          Close
        </Button>
      </div>
    </Modal>
  );
}
