import React from 'react';

interface DocumentActionsProps {
  onUpload: () => void;
  onSend: () => void;
  onViewPending: () => void;
  onCheckStatus: () => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ onUpload, onSend, onViewPending, onCheckStatus }) => (
  <div className="space-y-4">
    <button onClick={onUpload} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
      Upload New Document
    </button>
    <button onClick={onSend} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
      Send Document for Signature
    </button>
    <button onClick={onViewPending} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
      View Pending Signatures
    </button>
    <button onClick={onCheckStatus} className="w-full flex justify-start bg-blue-500 text-white px-4 py-2 rounded">
      Check Document Status
    </button>
  </div>
);

export default DocumentActions;
