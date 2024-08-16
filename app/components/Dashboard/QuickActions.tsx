import React, { useState, useRef } from 'react';
import { uploadDocument, createSignatureRequest, getPendingSignatures, getDocumentStatus } from '../../lib/api';
import { Button } from '../ui/button';
import { Document } from '../../shared/types';
import { Upload, Send, Clock, FileCheck } from 'lucide-react';

interface QuickActionsProps {
  onUpload: () => void;
  onSend: (documentId: string, signers: string[]) => void;
  onViewPending: () => void;
  onCheckStatus: () => void;
  onDocumentUploaded: (newDocument: Document) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onUpload,
  onSend,
  onViewPending,
  onCheckStatus,
  onDocumentUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [storageProvider, setStorageProvider] = useState('cloud');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storageProvider', storageProvider);
      const result = await uploadDocument(formData);
      onDocumentUploaded(result);
      alert('Document uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
    onUpload();
  };

  const handleSendForSignature = () => {
    const documentId = prompt('Enter document ID:');
    const signers = prompt('Enter signer emails (comma-separated):');
    if (documentId && signers) {
      onSend(documentId, signers.split(',').map(s => s.trim()));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <select
          value={storageProvider}
          onChange={(e) => setStorageProvider(e.target.value)}
          className="mb-2 w-full p-2 bg-gray-700 text-white rounded"
        >
          <option value="cloud">Cloud Storage</option>
          <option value="google">Google Drive</option>
          <option value="azure">Azure Cloud Drive</option>
          <option value="aws">AWS S3 Bucket</option>
        </select>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex justify-center items-center"
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload New Document'}
        </Button>
        {file && (
          <Button
            onClick={handleUpload}
            className="w-full mt-2 bg-green-500"
            disabled={isUploading}
          >
            Confirm Upload
          </Button>
        )}
      </div>
      <Button onClick={handleSendForSignature} className="w-full flex justify-center items-center">
        <Send className="mr-2 h-4 w-4" />
        Send Document for Signature
      </Button>
      <Button onClick={onViewPending} className="w-full flex justify-center items-center">
        <Clock className="mr-2 h-4 w-4" />
        View Pending Signatures
      </Button>
      <Button onClick={onCheckStatus} className="w-full flex justify-center items-center">
        <FileCheck className="mr-2 h-4 w-4" />
        Check Document Status
      </Button>
    </div>
  );
};