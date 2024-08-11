import React from 'react';
import { uploadDocument, createSignatureRequest, getPendingSignatures, getDocumentStatus } from '../../lib/api';
import { Button } from '../ui/button';
import { Document } from '../../shared/types';

interface QuickActionsProps {
  onUpload: () => void;
  onSend: () => void;
  onViewPending: () => void;
  onCheckStatus: () => void;
  onDocumentUploaded: (newDocument: Document) => void;
  onDocumentSent: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onUpload,
  onSend,
  onViewPending,
  onCheckStatus,
  onDocumentUploaded,
  onDocumentSent
}) => {
  return (
    <div className="space-y-4">
      <Button onClick={onUpload} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
        Upload New Document
      </Button>
      <Button onClick={onSend} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
        Send Document for Signature
      </Button>
      <Button onClick={onViewPending} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
        View Pending Signatures
      </Button>
      <Button onClick={onCheckStatus} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
        Check Document Status
      </Button>
    </div>
  );
};