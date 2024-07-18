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
  }
  
  export interface SignatureRequest {
    documentId: string;
    recipientEmail: string;
  }