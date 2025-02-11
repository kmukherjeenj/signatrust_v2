import React, { useState, useRef } from 'react';
import { uploadDocument } from '../../lib/api';
import { Button } from '../ui/button';
import { Document } from '../../shared/types';
import { Upload, Send, Clock, FileCheck } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface QuickActionsProps {
  onUpload: (newDocument: Document) => void;
  onSend: (documentId: string, signers: string[]) => void;
  onViewPending: () => void;
  onCheckStatus: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onUpload,
  onSend,
  onViewPending,
  onCheckStatus,
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
      onUpload(result);
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
  };

  const handleSendForSignature = () => {
    const documentId = prompt('Enter document ID:');
    const signers = prompt('Enter signer emails (comma-separated):');
    if (documentId && signers) {
      onSend(documentId, signers.split(',').map(s => s.trim()));
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <div>
        <Input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Select
          value={storageProvider}
          onValueChange={setStorageProvider}
        >
          <SelectTrigger className="mb-2 w-full">
            <SelectValue placeholder="Select storage provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cloud">Cloud Storage</SelectItem>
            <SelectItem value="google">Google Drive</SelectItem>
            <SelectItem value="azure">Azure Cloud Drive</SelectItem>
            <SelectItem value="aws">AWS S3 Bucket</SelectItem>
          </SelectContent>
        </Select>
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

export default QuickActions;