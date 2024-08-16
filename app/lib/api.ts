import axios from 'axios';
import { UserData, Document, SignatureRequest } from '../shared/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add an interceptor to include the authentication headers
api.interceptors.request.use((config) => {
  const zkProof = localStorage.getItem('zkProof');
  const publicSignals = localStorage.getItem('publicSignals');
  const challenge = localStorage.getItem('challenge');

  console.log('Sending headers:');
  console.log('ZK-Proof:', zkProof);
  console.log('Public-Signals:', publicSignals);
  console.log('Challenge:', challenge);

  if (zkProof && publicSignals && challenge) {
    config.headers['ZK-Proof'] = zkProof;
    config.headers['Public-Signals'] = publicSignals;
    config.headers['Challenge'] = challenge;
  }
  console.log('Final request config:', config);
  return config;
});

export const fetchUserData = async (): Promise<UserData> => {
  const response = await api.get('/user');
  return response.data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/document');
  return response.data;
};

export const uploadDocument = async (formData: FormData): Promise<Document> => {
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocument = async (documentId: string, key: string): Promise<Document> => {
  const response = await api.get(`/document/${documentId}`, { params: { key } });
  return response.data;
};

export const signDocument = async (documentId: string, signature: string): Promise<void> => {
  await api.post(`/document/${documentId}/sign`, { signature });
};

export const verifyDocument = async (documentId: string): Promise<boolean> => {
  const response = await api.get(`/document/${documentId}/verify`);
  return response.data;
};

export const createDID = async () => {
  const response = await api.post('/api/identity/create');
  return response.data;
};

export const getDocumentStatus = async (documentId: string): Promise<string> => {
  const response = await api.get(`/document/${documentId}/status`);
  return response.data;
};

export const getPendingSignatures = async (): Promise<SignatureRequest[]> => {
  const response = await api.get('/pending-signatures');
  return response.data;
};

export const createSignatureRequest = async (documentId: string, signers: string[]): Promise<SignatureRequest> => {
  const response = await api.post('/signature-requests', { documentId, signers });
  return response.data;
};

export const getSignatureRequests = async (): Promise<SignatureRequest[]> => {
  const response = await api.get('/signature-requests');
  return response.data;
};

export default api;