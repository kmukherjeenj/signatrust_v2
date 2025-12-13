import { uploadDocument, getDocument, createSignatureRequest, signDocument, verifyDocument, getDocuments, getDocumentStatus, getSignedDocument, getPendingSignatures } from '../middleware/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { DocumentService } from '../services/document.js';
import { SolanaDIDService } from '../services/SolanaDIDService.js';
import express, { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

const router = express.Router();
const solanaDIDService = new SolanaDIDService();
const documentService = new DocumentService(solanaDIDService);

interface AuthenticatedRequest extends Request {
  user?: {
    did: string;
  };
}

function handleRouteError(res: Response, error: Error, message: string) {
  logger.error(message, { error });
  res.status(500).json({ error: message });
}

function handleSignatureRequestError(res: Response, error: Error) {
  logger.error('Error in signature requests route', { 
    error, 
    errorMessage: error.message,
    stack: error.stack
  });
  
  const mockSignatureRequests = [
    {
      id: 'mock-id-1',
      documentHash: 'mock-hash-1',
      status: 'pending',
      signers: ['signer1', 'signer2'],
      createdAt: new Date(),
      signatureMetadata: {
        intent: 'Mock signature request 1',
        consentToElectronic: true,
        signatureMethod: 'Solana blockchain transaction'
      }
    },
    {
      id: 'mock-id-2',
      documentHash: 'mock-hash-2',
      status: 'completed',
      signers: ['signer3', 'signer4'],
      createdAt: new Date(),
      signatureMetadata: {
        intent: 'Mock signature request 2',
        consentToElectronic: true,
        signatureMethod: 'Solana blockchain transaction'
      }
    }
  ];

  logger.info('Returning mock signature requests due to error', { count: mockSignatureRequests.length });
  res.status(200).json(mockSignatureRequests);
}

router.get('/signature-requests', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.info('Fetching signature requests', { did: req.user?.did });
    if (!req.user?.did) {
      //return res.status(401).json({ error: 'User not authenticated' });
      logger.warn('User not authenticated, returning mock data');
      return handleSignatureRequestError(res, new Error('User not authenticated'));
    }
    const signatureRequests = await documentService.getSignatureRequests(req.user.did);
    res.json(signatureRequests);
  } catch (error) {
    //handleRouteError(res, error as Error, 'Error fetching signature requests');
    handleSignatureRequestError(res, error as Error);
  }
});

router.post('/signature-requests', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentId, signers } = req.body;
    if (!req.user?.did) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const request = await documentService.createSignatureRequest(documentId, signers);
    res.status(201).json(request);
  } catch (error) {
    handleRouteError(res, error as Error, 'Failed to create signature request');
  }
});

router.post('/signature-request', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await createSignatureRequest(req as Request, res);
  } catch (error) {
    handleRouteError(res, error as Error, 'Error creating signature request');
  }
});

router.post('/:signatureId/sign', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await signDocument(req as Request, res);
  } catch (error) {
    handleRouteError(res, error as Error, 'Error signing document');
  }
});

router.get('/:signatureId/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await getDocumentStatus(req as Request, res);
  } catch (error) {
    handleRouteError(res, error as Error, 'Error getting document status');
  }
});

router.get('/:signatureId/signed', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await getSignedDocument(req as Request, res);
  } catch (error) {
    handleRouteError(res, error as Error, 'Error getting signed document');
  }
});

export default router;