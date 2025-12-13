export interface DocumentMetadata {
    id: string;
    name: string;
    hash: string;
    status: 'pending' | 'signed' | 'expired';
    createdAt: Date;
    signers: string[];
}
export type Document = DocumentMetadata;
