import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import DocumentList from './DocumentList';
import { Document } from '../../shared/types';

interface DocumentSectionProps {
  documents: Document[];
  onSign: (documentId: string) => void;
  onSendForSignature: (documentId: string, signers: string[]) => void;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ documents, onSign, onSendForSignature }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentList 
          documents={documents} 
          onSign={onSign} 
          onSendForSignature={onSendForSignature}
        />
      </CardContent>
    </Card>
  );
};

export default DocumentSection;