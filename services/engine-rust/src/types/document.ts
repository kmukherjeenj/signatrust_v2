export interface DocumentMetadata {
    id: string;
    name: string;
    hash: string;
    status: 'pending' | 'signed' | 'expired';
    createdAt: Date;
    signers: string[];
    // Add any other relevant fields
  }
  
  export type Document = DocumentMetadata;
  // If Document should have additional properties beyond DocumentMetadata, define them here