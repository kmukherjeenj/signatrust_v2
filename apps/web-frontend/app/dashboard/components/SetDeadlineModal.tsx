'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Button } from '@/components/ui';

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

  const handleSubmit = async (removeDeadline = false) => {
    setSubmitting(true);

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

      toast.success(removeDeadline ? 'Deadline removed' : 'Deadline updated');
      onUpdated();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update deadline');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate min date (now + 1 hour)
  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="md"
      title={currentDeadline ? 'Edit Deadline' : 'Set Deadline'}
    >
      <div className="mb-4">
        <label htmlFor="deadline-input" className="block text-sm text-zinc-400 mb-1">
          Signing Deadline
        </label>
        <input
          id="deadline-input"
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

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        {currentDeadline && (
          <Button
            variant="ghost"
            onClick={() => handleSubmit(true)}
            loading={submitting}
            className="text-amber-400 hover:text-amber-300"
          >
            Remove Deadline
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => handleSubmit(false)}
          disabled={!deadline}
          loading={submitting}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}
