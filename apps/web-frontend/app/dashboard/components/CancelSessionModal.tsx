'use client';

import { useState } from 'react';

interface CancelSessionModalProps {
  sessionId: string;
  documentName: string;
  onClose: () => void;
  onCancelled: () => void;
}

export function CancelSessionModal({
  sessionId,
  documentName,
  onClose,
  onCancelled,
}: CancelSessionModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to cancel session');
      }

      onCancelled();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold mb-2">Cancel Signing Session</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Are you sure you want to cancel the signing request for{' '}
          <strong className="text-white">{documentName}</strong>?
        </p>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 mb-4">
          <p className="text-xs text-amber-300">
            This action cannot be undone. All pending signers will be notified and
            their signing links will be invalidated. The cancellation will be
            recorded on the blockchain.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Document updated, new version required"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:outline-none focus:border-white/20"
            rows={2}
            maxLength={500}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Keep Session
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {submitting ? 'Cancelling...' : 'Cancel Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
