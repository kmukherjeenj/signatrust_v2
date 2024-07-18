import { UserData, Document, SignatureRequest } from '../../shared/types';

const API_BASE_URL = '/api';

export const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch(`${API_BASE_URL}/user`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
};

export const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch(`${API_BASE_URL}/documents`);
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
};

export const uploadDocument = async (formData: FormData): Promise<Document> => {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload document');
  return response.json();
};

export const sendForSignature = async (request: SignatureRequest): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/sign/${request.documentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to send document for signature');
};

export const fetchPendingSignatures = async (): Promise<Document[]> => {
  const response = await fetch(`${API_BASE_URL}/documents/pending`);
  if (!response.ok) throw new Error('Failed to fetch pending signatures');
  return response.json();
};

export const checkDocumentStatus = async (documentId: string): Promise<Document> => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}/status`);
  if (!response.ok) throw new Error('Failed to check document status');
  return response.json();
};