'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CancelSessionModal } from './CancelSessionModal';
import { ResendInvitesModal } from './ResendInvitesModal';
import { SetDeadlineModal } from './SetDeadlineModal';
import { AuditLogModal } from './AuditLogModal';

interface Signer {
  id: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  resendCount: number;
  lastResendAt?: string | null;
}

interface SessionActionsProps {
  sessionId: string;
  documentName: string;
  status: string;
  expiresAt?: string | null;
  signers: Signer[];
  sequentialSigning?: boolean;
}

export function SessionActions({
  sessionId,
  documentName,
  status,
  expiresAt,
  signers,
  sequentialSigning = false,
}: SessionActionsProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isSequential, setIsSequential] = useState(sequentialSigning);
  const [togglingSequential, setTogglingSequential] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleToggleSequential = async () => {
    setTogglingSequential(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/sequential-signing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isSequential }),
      });
      if (response.ok) {
        setIsSequential(!isSequential);
      }
    } catch (error) {
      console.error('Failed to toggle sequential signing:', error);
    } finally {
      setTogglingSequential(false);
    }
  };

  const pendingSignersCount = signers.filter((s) => s.status === 'pending').length;
  const isPending = status === 'pending';

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
        {/* View Audit Log - always available */}
        <button
          onClick={() => setShowAuditLog(true)}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 px-2 py-1 rounded hover:bg-white/5 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Audit Log
        </button>

        {/* Actions only for pending sessions */}
        {isPending && (
          <>
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>

            {pendingSignersCount > 0 && (
              <button
                onClick={() => setShowResendModal(true)}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-cyan-500/10 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend Invites
              </button>
            )}

            <button
              onClick={() => setShowDeadlineModal(true)}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {expiresAt ? 'Edit Deadline' : 'Set Deadline'}
            </button>

            {/* Sequential Signing Toggle */}
            <button
              onClick={handleToggleSequential}
              disabled={togglingSequential}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                isSequential
                  ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {togglingSequential ? 'Updating...' : isSequential ? 'Sequential: ON' : 'Sequential: OFF'}
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      {showCancelModal && (
        <CancelSessionModal
          sessionId={sessionId}
          documentName={documentName}
          onClose={() => setShowCancelModal(false)}
          onCancelled={() => {
            setShowCancelModal(false);
            handleRefresh();
          }}
        />
      )}

      {showResendModal && (
        <ResendInvitesModal
          sessionId={sessionId}
          documentName={documentName}
          signers={signers}
          onClose={() => setShowResendModal(false)}
          onResent={handleRefresh}
        />
      )}

      {showDeadlineModal && (
        <SetDeadlineModal
          sessionId={sessionId}
          currentDeadline={expiresAt}
          onClose={() => setShowDeadlineModal(false)}
          onUpdated={handleRefresh}
        />
      )}

      {showAuditLog && (
        <AuditLogModal
          sessionId={sessionId}
          documentName={documentName}
          onClose={() => setShowAuditLog(false)}
        />
      )}
    </>
  );
}
