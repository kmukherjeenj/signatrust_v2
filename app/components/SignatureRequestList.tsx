// File: components/Dashboard/SignatureRequestList.tsx

import React from 'react';
import { SignatureRequest } from '../shared/types';

interface SignatureRequestListProps {
  requests: SignatureRequest[];
  onSign?: (documentId: string) => Promise<void>;
}

const SignatureRequestList: React.FC<SignatureRequestListProps> = ({ requests, onSign }) => {
  return (
    <ul className="space-y-4">
      {requests.map((request) => (
        <li key={request.id} className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Document: {request.documentId}</h3>
              <p className="text-sm text-gray-400">Status: {request.status}</p>
              <p className="text-sm text-gray-400">Signers: {request.signers.join(', ')}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SignatureRequestList;