export interface UserData {
  did: string;
  name?: string;
  email?: string;
}

export interface Document {
  id: string;
  name: string;
  status: 'pending' | 'signed' | 'expired';
  date: string;
  // Adding hash and signers from the previous implementation
  hash?: string;
  signers?: string[];
}

export interface SignatureRequest {
  id: string;
  documentId: string;
  recipientEmail: string;
  documentName: string;
  status: 'pending' | 'completed' | 'expired';
  signers: string[];
  createdAt: string;
}