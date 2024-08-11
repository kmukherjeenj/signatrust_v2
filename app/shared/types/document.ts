export interface Document {
    id: string;
    name: string;
    status: 'pending' | 'signed' | 'expired';
    date: string;
  }
  