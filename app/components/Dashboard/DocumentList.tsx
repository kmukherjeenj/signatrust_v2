// File: components/Dashboard/DocumentList.tsx

import React from 'react';
import { Button } from '../ui/button';
import { Document } from '../../shared/types';

interface DocumentListProps {
  documents: Document[];
  onSign: (documentId: string) => void;
  onSendForSignature: (documentId: string, signers: string[]) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSign, onSendForSignature }) => {
  return (
    <ul className="space-y-4">
      {documents.map((doc) => (
        <li key={doc.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
          <span>{doc.name}</span>
          <div>
            <Button onClick={() => onSign(doc.id)} className="mr-2">Sign</Button>
            <Button onClick={() => {
              const signers = prompt('Enter signer emails (comma-separated):');
              if (signers) {
                onSendForSignature(doc.id, signers.split(',').map(s => s.trim()));
              }
            }}>Send for Signature</Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DocumentList;