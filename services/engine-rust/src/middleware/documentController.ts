import { Request, Response, NextFunction } from 'express';
import { SolanaDIDService } from '../services/SolanaDIDService.js';
import { DocumentService } from '../services/document.js';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { randomBytes, createHash } from 'crypto';
import { Document, DocumentMetadata } from '../types/document.js';
import { sendSignatureRequestEmail, notifyAllParties } from '../services/emailService.js';

const solanaDIDService = new SolanaDIDService(config.solana.rpcUrl, config.solana.programId);
const documentService = new DocumentService(solanaDIDService);

// Define a custom interface for the authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    did: string;
    cloudStorage?: string;
  };
}

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { document, metadata } = req.body;
    const did = req.user?.did;
    const cloudStorage = req.user?.cloudStorage;

    if (!did) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!cloudStorage) {
      return res.status(400).json({ error: 'User cloud storage not configured' });
    }

    //const key = Buffer.from(crypto.randomBytes(32));
    const key = Buffer.from(randomBytes(32));
    //const { encryptedDocument, iv } = await DocumentService.encryptDocument(document, key);
    const { encryptedDocument, iv } = await documentService.encryptDocument(document, key);
    //const documentHash = DocumentService.hashDocument(document);
    const documentHash = createHash('sha256').update(document).digest('hex');

    // Store document hash on Solana
    //await documentService.storeDocumentHash(did, documentHash);
    await solanaDIDService.storeDocumentHash(did, documentHash);

    // Store encrypted document and metadata
    const documentId = await documentService.storeDocumentReference(
      cloudStorage,
      documentHash,
      encryptedDocument,
      iv,
      1 // Initial version
    );

    res.status(201).json({ documentId, key: key.toString('hex') });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const getDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const { key } = req.query;

    if (typeof key !== 'string') {
      return res.status(400).json({ error: 'Invalid key provided' });
    }

    const docReference = await documentService.getDocumentReference(documentId);
    const decryptedDocument = await documentService.decryptDocument(
      docReference.encryptedDocument,
      Buffer.from(key, 'hex'),
      docReference.iv
    );

    res.json({ document: decryptedDocument, metadata: docReference });
  } catch (error) {
    logger.error('Error retrieving document:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
};

export const createSignatureRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { document, signers } = req.body;
    const did = req.user?.did;

    if (!did) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const signatureId = await documentService.createSignatureRequest(Buffer.from(document), signers);
    
    // Create an envelope (similar to DocuSign's concept)
    const envelope = {
      status: 'sent',
      documentId: signatureId,
      signers: signers,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
    };

    await documentService.createEnvelope(envelope);

    // Send email notifications to signers
    for (const signer of signers) {
      await sendSignatureRequestEmail(signer.email, signatureId);
    }

    res.status(201).json({ signatureId, message: 'Signature request created and sent to signers' });
  } catch (error) {
    logger.error('Error creating signature request:', error);
    res.status(500).json({ error: 'Failed to create signature request' });
  }
};

export const signDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { signatureId } = req.params;
    const { signature } = req.body;
    const did = req.user?.did;

    if (!did) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await documentService.signDocument(signatureId, did, signature);
    const txSignature = await solanaDIDService.signDocument(did, signatureId, signature);

    // Update envelope status
    await documentService.updateEnvelopeStatus(signatureId, 'signed');

    // Check if all signers have signed
    const allSigned = await documentService.checkAllSignersSigned(signatureId);
    if (allSigned) {
      await documentService.updateEnvelopeStatus(signatureId, 'completed');
      // Notify all parties that the document is fully signed
      await notifyAllParties(signatureId);
    }

    res.status(200).json({ message: 'Document signed successfully', transactionSignature: txSignature });
  } catch (error) {
    logger.error('Error signing document:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
};

export const verifyDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const docReference = await documentService.getDocumentReference(documentId);
    const isVerified = await solanaDIDService.verifyDocumentHash(docReference.hash);
    res.json({ isVerified });
  } catch (error) {
    logger.error('Error verifying document:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
};

export const getDocuments = async (userDid: string): Promise<Document[]> => {
  try {
    const documents = await documentService.getUserDocuments(userDid);
    return documents;
  } catch (error) {
    logger.error('Error fetching documents:', error);
    throw new Error('Failed to retrieve documents');
  }
};

export const getDocumentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { signatureId } = req.params;
    const status = await documentService.getEnvelopeStatus(signatureId);
    res.json({ status });
  } catch (error) {
    logger.error('Error retrieving document status:', error);
    res.status(500).json({ error: 'Failed to retrieve document status' });
  }
};

export const getPendingSignatures = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userDid = req.user?.did;
    if (!userDid) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const pendingSignatures = await documentService.getPendingSignatures(userDid);
    res.json(pendingSignatures);
  } catch (error) {
    logger.error('Error retrieving pending signatures:', error);
    res.status(500).json({ error: 'Failed to retrieve pending signatures' });
  }
};

export const getSignedDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { signatureId } = req.params;
    const document = await documentService.getSignedDocument(signatureId);
    res.json({ document: document.toString('base64') }); // Convert Buffer to base64 string for JSON response
  } catch (error) {
    logger.error('Error retrieving signed document:', error);
    res.status(500).json({ error: 'Failed to retrieve signed document' });
  }
};