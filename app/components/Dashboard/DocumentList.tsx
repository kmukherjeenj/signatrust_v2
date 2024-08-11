import React from 'react';
import { Document } from '../../shared/types';

interface DocumentListProps {
  documents: Document[];
  onSign: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onSign }) => (
  <div className="space-y-4">
    {documents.map((doc) => (
      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
        <div className="flex items-center">
          <span>{doc.name}</span>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs ${doc.status === 'pending' ? 'bg-yellow-500' : doc.status === 'signed' ? 'bg-green-500' : 'bg-red-500'}`}>
            {doc.status}
          </span>
          <span className="ml-2 text-sm text-gray-400">{doc.date}</span>
        </div>
        <button onClick={() => onSign(doc.id)} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
          Sign
        </button>
      </div>
    ))}
  </div>
);

export default DocumentList;
