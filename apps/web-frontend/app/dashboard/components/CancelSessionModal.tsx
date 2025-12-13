'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Button } from '@/components/ui';

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

  const handleCancel = async () => {
    setSubmitting(true);

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

      toast.success('Session cancelled successfully');
      onCancelled();
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} size="md" title="Cancel Signing Session">
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
        <label htmlFor="cancel-reason" className="block text-sm text-zinc-400 mb-1">
          Reason (optional)
        </label>
        <textarea
          id="cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Document updated, new version required"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm focus:outline-none focus:border-white/20"
          rows={2}
          maxLength={500}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Keep Session
        </Button>
        <Button
          variant="danger"
          onClick={handleCancel}
          loading={submitting}
        >
          Cancel Session
        </Button>
      </div>
    </Modal>
  );
}
