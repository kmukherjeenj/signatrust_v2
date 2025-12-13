import { SolanaDIDService } from './SolanaDIDService.js';
interface SignatureData {
    signerDid: string;
    signature: string;
    timestamp: Date;
    ip: string;
}
interface DocumentMetadata {
    id: string;
    name: string;
    hash: string;
    status: 'pending' | 'signed' | 'expired';
    createdAt: Date;
    signers: string[];
}
export declare class DocumentService {
    private signatureRequests;
    private documents;
    private solanaDIDService;
    private connection;
    private payerKeypair;
    private programId;
    constructor(solanaDIDService: SolanaDIDService);
    createEnvelope(envelope: {
        status: string;
        documentId: string;
        signers: {
            email: string;
            name: string;
        }[];
        createdAt: Date;
        expiresAt: Date;
    }): Promise<void>;
    updateEnvelopeStatus(signatureId: string, status: string): Promise<void>;
    checkAllSignersSigned(signatureId: string): Promise<boolean>;
    getEnvelopeStatus(signatureId: string): Promise<string>;
    encryptDocument(document: string, key: Buffer): Promise<{
        encryptedDocument: Buffer;
        iv: Buffer;
    }>;
    decryptDocument(encryptedDocument: Buffer, key: Buffer, iv: Buffer): Promise<string>;
    storeDocumentReference(userCloudStorage: string, documentHash: string, encryptedDocument: Buffer, iv: Buffer, version: number): Promise<string>;
    getDocumentReference(documentId: string, version?: number): Promise<{
        documentId: string;
        hash: string;
        encryptedDocument: Buffer;
        iv: Buffer;
        version: number;
    }>;
    createSignatureRequest(document: Buffer, signers: string[]): Promise<string>;
    getUserDocuments(userDid: string): Promise<DocumentMetadata[]>;
    getDocumentStatus(documentId: string): Promise<string>;
    getPendingSignatures(userDid: string): Promise<DocumentMetadata[]>;
    signDocument(signatureId: string, signerDid: string, signature: string): Promise<void>;
    private hashDocument;
    private storeSignatureRequest;
    private getSignatureRequest;
    private updateSignatureRequest;
    getSignatureStatus(signatureId: string): Promise<{
        status: string;
        signatures: SignatureData[];
    }>;
    getSignedDocument(signatureId: string): Promise<Buffer>;
    verifySignature(signatureId: string, documentHash: string): Promise<boolean>;
}
export {};
