'use client';

import { useState } from 'react';

interface SetDeadlineModalProps {
  sessionId: string;
  currentDeadline?: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function SetDeadlineModal({
  sessionId,
  currentDeadline,
  onClose,
  onUpdated,
}: SetDeadlineModalProps) {
  const [deadline, setDeadline] = useState(
    currentDeadline ? new Date(currentDeadline).toISOString().slice(0, 16) : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (removeDeadline = false) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresAt: removeDeadline ? null : deadline ? new Date(deadline).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to update deadline');
      }

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate min date (now + 1 hour)
  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold mb-4">
          {currentDeadline ? 'Edit Deadline' : 'Set Deadline'}
        </h2>

        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">
            Signing Deadline
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={minDate}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:outline-none focus:border-white/20"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Leave empty for no deadline. Signers will not be able to sign after
            this time.
          </p>
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
            Cancel
          </button>
          {currentDeadline && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="rounded-lg border border-amber-500/30 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
            >
              Remove Deadline
            </button>
          )}
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting || !deadline}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
