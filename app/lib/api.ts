import axios from 'axios';
import { UserData, Document, SignatureRequest } from '../shared/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const fetchUserData = async (): Promise<UserData> => {
  const response = await api.get('/api/user');
  return response.data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/api/document');
  return response.data;
};

export const uploadDocument = async (document: string, metadata: any): Promise<Document> => {
  const response = await api.post('/api/document/upload', { document, metadata });
  return response.data;
};

export const getDocument = async (documentId: string, key: string): Promise<Document> => {
  const response = await api.get(`/api/document/${documentId}`, { params: { key } });
  return response.data;
};

export const signDocument = async (documentId: string, signature: string): Promise<void> => {
  await api.post(`/api/document/${documentId}/sign`, { signature });
};

export const verifyDocument = async (documentId: string): Promise<boolean> => {
  const response = await api.get(`/api/document/${documentId}/verify`);
  return response.data;
};

export const createDID = async () => {
  const response = await api.post('/api/identity/create');
  return response.data;
};

export const getDocumentStatus = async (documentId: string): Promise<string> => {
  const response = await api.get(`/api/document/${documentId}/status`);
  return response.data;
};

export const getPendingSignatures = async (): Promise<Document[]> => {
  const response = await api.get('/api/document/pending-signatures');
  return response.data;
};

export const createSignatureRequest = async (documentId: string, signers: string[]): Promise<void> => {
  await api.post('/api/document/signature-request', { documentId, signers });
};

export default api;