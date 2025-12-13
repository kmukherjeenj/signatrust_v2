import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import logger from '../utils/logger.js';
import { throwAppError } from '../utils/errors.js';
import { SolanaDIDService } from './SolanaDIDService.js';
import { Request, Response } from 'express';
import * as borsh from 'borsh';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });
interface SignatureRequest {
  id: string;
  documentHash: string;
  signers: string[];
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
  signatureMetadata: {
    intent: string;
    consentToElectronic: boolean;
    signatureMethod: string;
  };
  signatures?: SignatureData[];
}

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

class DocumentAccount {
  document_hash: Uint8Array;
  status: number;
  signers: PublicKey[];
  signatures: { signer: PublicKey; signature: Uint8Array }[];

  constructor(fields: {
    document_hash: Uint8Array,
    status: number,
    signers: PublicKey[],
    signatures: { signer: PublicKey; signature: Uint8Array }[]
  }) {
    this.document_hash = fields.document_hash;
    this.status = fields.status;
    this.signers = fields.signers;
    this.signatures = fields.signatures;
  }
}

const DocumentAccountSchema = new Map([
  [DocumentAccount, {
    kind: 'struct',
    fields: [
      ['document_hash', [32]],
      ['status', 'u8'],
      ['signers', [PublicKey]],
      ['signatures', [{ kind: 'struct', fields: [['signer', PublicKey], ['signature', [64]]] }]]
    ]
  }]
]);

export class DocumentService {
  private signatureRequests: Map<string, SignatureRequest> = new Map();
  private documents: Map<string, DocumentMetadata> = new Map();
  private solanaDIDService: SolanaDIDService;
  private connection: Connection;
  private payerKeypair: Keypair;
  private programId: PublicKey;

  constructor(solanaDIDService: SolanaDIDService) {
    this.solanaDIDService = solanaDIDService;

    // Ensure RPC URL is set
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC_URL environment variable is not set');
    }
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Ensure Program ID is set and valid
    const programIdStr = process.env.SOLANA_PROGRAM_ID;
    if (!programIdStr) {
      throw new Error('SOLANA_PROGRAM_ID environment variable is not set');
    }
    try {
      this.programId = new PublicKey(programIdStr);
    } catch (e) {
      throw new Error('Invalid SOLANA_PROGRAM_ID');
    }

    // Ensure Payer Private Key is set and valid
    const payerPrivateKeyStr = process.env.SOLANA_PAYER_PRIVATE_KEY;
    if (!payerPrivateKeyStr) {
      throw new Error('SOLANA_PAYER_PRIVATE_KEY environment variable is not set');
    }
    try {
      const payerPrivateKeyBytes = JSON.parse(payerPrivateKeyStr);
      if (!Array.isArray(payerPrivateKeyBytes) || payerPrivateKeyBytes.some(isNaN)) {
        throw new Error('Invalid SOLANA_PAYER_PRIVATE_KEY format');
      }
      this.payerKeypair = Keypair.fromSecretKey(new Uint8Array(payerPrivateKeyBytes));
    } catch (e) {
      logger.error('Error parsing SOLANA_PAYER_PRIVATE_KEY:', e);
      throw new Error('Invalid SOLANA_PAYER_PRIVATE_KEY');
    }

    logger.info('Document service initialized with the following configuration:');
    logger.info(`RPC URL: ${rpcUrl}`);
    logger.info(`Program ID: ${this.programId.toBase58()}`);
    logger.info(`Payer Keypair: ${this.payerKeypair.publicKey.toBase58()}`);
  }

  async createEnvelope(envelope: {
    status: string;
    documentId: string;
    signers: { email: string; name: string }[];
    createdAt: Date;
    expiresAt: Date;
  }): Promise<void> {
    try {
      const data = Buffer.from(JSON.stringify(envelope));
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: this.payerKeypair.publicKey,
          newAccountPubkey: Keypair.generate().publicKey,
          space: data.length,
          lamports: await this.connection.getMinimumBalanceForRentExemption(data.length),
          programId: SystemProgram.programId,
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payerKeypair.publicKey;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair]
      );

      logger.info(`Envelope created on Solana blockchain. Signature: ${signature}`);
    } catch (error) {
      logger.error('Failed to create envelope on Solana blockchain', { error });
      throw throwAppError('Failed to create envelope', 500);
    }
  }

  async updateEnvelopeStatus(signatureId: string, status: string): Promise<void> {
    try {
      const data = Buffer.from(JSON.stringify({ signatureId, status }));
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.payerKeypair.publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: LAMPORTS_PER_SOL / 1000, // Small amount for demonstration
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payerKeypair.publicKey;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair]
      );

      logger.info(`Envelope status updated on Solana blockchain. Signature: ${signature}`);
    } catch (error) {
      logger.error('Failed to update envelope status on Solana blockchain', { error, signatureId, status });
      throw throwAppError('Failed to update envelope status', 500);
    }
  }

  async checkAllSignersSigned(signatureId: string): Promise<boolean> {
    try {
      // In a real implementation, you would query your Solana program for this information
      // For this example, we'll simulate a blockchain query with a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.payerKeypair.publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: LAMPORTS_PER_SOL / 1000,
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payerKeypair.publicKey;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair]
      );

      logger.info(`Checked signers status for ${signatureId} on Solana blockchain. Signature: ${signature}`);
      
      // For demonstration, we'll return true
      return true;
    } catch (error) {
      logger.error('Failed to check if all signers have signed on Solana blockchain', { error, signatureId });
      throw throwAppError('Failed to check if all signers have signed', 500);
    }
  }

  async getEnvelopeStatus(signatureId: string): Promise<string> {
    try {
      // In a real implementation, you would query your Solana program for this information
      // For this example, we'll simulate a blockchain query with a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.payerKeypair.publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: LAMPORTS_PER_SOL / 1000,
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payerKeypair.publicKey;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair]
      );

      logger.info(`Retrieved envelope status for ${signatureId} from Solana blockchain. Signature: ${signature}`);
      
      // For demonstration, we'll return a placeholder status
      return 'pending';
    } catch (error) {
      logger.error('Failed to get envelope status from Solana blockchain', { error, signatureId });
      throw throwAppError('Failed to get envelope status', 500);
    }
  }

  async encryptDocument(document: string, key: Buffer): Promise<{ encryptedDocument: Buffer; iv: Buffer }> {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encryptedDocument = Buffer.concat([cipher.update(document, 'utf8'), cipher.final()]);
    return { encryptedDocument, iv };
  }

  async decryptDocument(encryptedDocument: Buffer, key: Buffer, iv: Buffer): Promise<string> {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedDocument), decipher.final()]);
    return decrypted.toString('utf8');
  }

  async storeDocumentReference(userCloudStorage: string, documentHash: string, encryptedDocument: Buffer, iv: Buffer, version: number): Promise<string> {
    try {
      const documentId = uuidv4();
      logger.info(`Storing document ${documentId} with hash ${documentHash} in ${userCloudStorage}, version ${version}`);
      return documentId;
    } catch (error) {
      logger.error('Failed to store document reference', { error, userCloudStorage, documentHash });
      throw throwAppError('Failed to store document reference', 500);
    }
  }

  async getDocumentReference(documentId: string, version?: number): Promise<{ documentId: string; hash: string; encryptedDocument: Buffer; iv: Buffer; version: number }> {
    try {
      logger.info(`Retrieving document ${documentId}, version ${version || 'latest'}`);
      return {
        documentId,
        hash: 'placeholder_hash',
        encryptedDocument: Buffer.from('placeholder_encrypted_document'),
        iv: Buffer.from('placeholder_iv'),
        version: version || 1
      };
    } catch (error) {
      logger.error(`Failed to retrieve document reference: ${documentId}`, { error });
      throw throwAppError('Failed to retrieve document reference', 404);
    }
  }

  async createSignatureRequest(document: Buffer, signers: string[]): Promise<string> {
    const signatureId = uuidv4();
    const documentHash = this.hashDocument(document);

    const signatureRequest: SignatureRequest = {
      id: signatureId,
      documentHash,
      signers,
      status: 'pending',
      createdAt: new Date(),
      signatureMetadata: {
        intent: 'To sign the document electronically',
        consentToElectronic: true,
        signatureMethod: 'Solana blockchain transaction',
      },
    };

    await this.storeSignatureRequest(signatureRequest);

    return signatureId;
  }

  async getUserDocuments(userDid: string): Promise<DocumentMetadata[]> {
    try {
      // In a real implementation, you would query your database or storage system
      // Here, we're just filtering the in-memory map
      const userDocuments = Array.from(this.documents.values()).filter(doc => 
        doc.signers.includes(userDid)
      );
      logger.info(`Retrieved documents for user: ${userDid}`);
      return userDocuments;
    } catch (error) {
      logger.error('Failed to retrieve user documents', { error, userDid });
      throw throwAppError('Failed to retrieve user documents', 500);
    }
  }

  async getDocumentStatus(documentId: string): Promise<string> {
    try {
      const document = this.documents.get(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      // In a real implementation, you might also check the status on the blockchain
      const blockchainStatus = await this.solanaDIDService.verifyDocumentHash(document.hash);
      logger.info(`Retrieved status for document: ${documentId}`);
      return blockchainStatus ? document.status : 'unverified';
    } catch (error) {
      logger.error('Failed to retrieve document status', { error, documentId });
      throw throwAppError('Failed to retrieve document status', 500);
    }
  }

  async getPendingSignatures(userDid: string): Promise<DocumentMetadata[]> {
    try {
      // In a real implementation, you would query your database or storage system
      // Here, we're just filtering the in-memory map
      const pendingDocuments = Array.from(this.documents.values()).filter(doc => 
        doc.signers.includes(userDid) && doc.status === 'pending'
      );
      logger.info(`Retrieved pending signatures for user: ${userDid}`);
      return pendingDocuments;
    } catch (error) {
      logger.error('Failed to retrieve pending signatures', { error, userDid });
      throw throwAppError('Failed to retrieve pending signatures', 500);
    }
  }
    
  async signDocument(signatureId: string, signerDid: string, signature: string): Promise<void> {
    const signatureRequest = await this.getSignatureRequest(signatureId);

    if (!signatureRequest.signers.includes(signerDid)) {
      throw new Error('Signer not authorized for this document');
    }

    const signatureData: SignatureData = {
      signerDid,
      signature,
      timestamp: new Date(),
      ip: '0.0.0.0', // Implement IP capture in a privacy-preserving way
    };

    await this.updateSignatureRequest(signatureId, signatureData);
  }

  private hashDocument(document: Buffer): string {
    return createHash('sha256').update(document).digest('hex');
  }

  private async storeSignatureRequest(signatureRequest: SignatureRequest): Promise<void> {
    this.signatureRequests.set(signatureRequest.id, signatureRequest);
    logger.info(`Stored signature request ${signatureRequest.id}`);
  }

  private async getSignatureRequest(signatureId: string): Promise<SignatureRequest> {
    const signatureRequest = this.signatureRequests.get(signatureId);
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }
    return signatureRequest;
  }

  private async updateSignatureRequest(signatureId: string, signatureData: SignatureData): Promise<void> {
    const signatureRequest = await this.getSignatureRequest(signatureId);
    if (!signatureRequest.signatures) {
      signatureRequest.signatures = [];
    }
    signatureRequest.signatures.push(signatureData);
    
    if (signatureRequest.signatures.length === signatureRequest.signers.length) {
      signatureRequest.status = 'completed';
    }

    await this.storeSignatureRequest(signatureRequest);
    logger.info(`Updated signature request ${signatureId} with new signature`);
  }

  async getSignatureStatus(signatureId: string): Promise<{ status: string; signatures: SignatureData[] }> {
    const signatureRequest = await this.getSignatureRequest(signatureId);
    return {
      status: signatureRequest.status,
      signatures: signatureRequest.signatures || []
    };
  }

  async getSignedDocument(signatureId: string): Promise<Buffer> {
    try {
      const signatureRequest = await this.getSignatureRequest(signatureId);
      
      if (signatureRequest.status !== 'completed') {
        throw new Error('Document has not been fully signed yet');
      }
  
      // In a real implementation, you would retrieve the actual document content using the document hash
      // For this example, we'll simulate retrieving the document from Solana
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.payerKeypair.publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: LAMPORTS_PER_SOL / 1000,
        })
      );
  
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.payerKeypair.publicKey;
  
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair]
      );
  
      logger.info(`Retrieved signed document for ${signatureId} from Solana blockchain. Signature: ${signature}`);
  
      // For demonstration, we'll return a placeholder buffer
      // In a real implementation, you would decrypt and return the actual document content
      return Buffer.from(`Signed document content for ${signatureId}`);
    } catch (error) {
      logger.error('Failed to get signed document', { error, signatureId });
      throw throwAppError('Failed to get signed document', 500);
    }
  }

  async verifySignature(signatureId: string, documentHash: string): Promise<boolean> {
    const signatureRequest = await this.getSignatureRequest(signatureId);
    return signatureRequest.documentHash === documentHash && signatureRequest.status === 'completed';
  }
}