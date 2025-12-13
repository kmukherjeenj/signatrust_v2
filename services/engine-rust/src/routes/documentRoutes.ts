import express, { Request, Response, NextFunction } from 'express';
import { uploadDocument, getDocument, createSignatureRequest, signDocument, verifyDocument, getDocuments, getDocumentStatus, getSignedDocument, getPendingSignatures  } from '../middleware/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { SolanaDIDService } from '../services/SolanaDIDService.js';
import { DocumentService } from '../services/document.js';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { DocumentMetadata } from '../types/document.js';

const router = express.Router();
//const solanaDIDService = new SolanaDIDService(config.solana.rpcUrl, config.solana.programId);
//const documentService = new DocumentService(solanaDIDService);

interface AuthenticatedRequest extends Request {
    user?: {
      did: string;
      // Add other user properties as needed
    };
  }

// Helper function for error handling
const handleRouteError = (res: Response, error: Error, errorMessage: string) => {
    logger.error(errorMessage, { error: error.message, stack: error.stack });
    const statusCode = (error as any).statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'An unexpected error occurred' });
  };

//router.get('/', authMiddleware, getDocuments);
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.did) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      //const documents = await getDocuments(req.user.did);
      const documents: DocumentMetadata[] = await getDocuments(req.user.did);
      res.json(documents);
    } catch (error) {
      handleRouteError(res, error as Error, 'Error fetching documents');
    }
  });
//router.post('/upload', authMiddleware, uploadDocument);
router.post('/upload', authMiddleware, async (req: AuthenticatedRequest, res: Response)  => {
    try {
      if (!req.user?.did) {
        return res.status(401).json({ error: 'User not authenticated' });
        }
      const result = await uploadDocument(req, res);
      res.status(201).json(result);
    } catch (error) {
      handleRouteError(res, error as Error, 'Error uploading document');
    }
  });
//router.get('/:documentId', authMiddleware, getDocument);
router.get('/:documentId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Fetching document', { documentId: req.params.documentId, did: req.user?.did });
        if (!req.user?.did) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await getDocument(req, res);
    } catch (error) {
        handleRouteError(res, error as Error, `Error fetching document ${req.params.documentId}`);
    }
});
//router.post('/signature-request', authMiddleware, createSignatureRequest);
router.post('/signature-request', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Creating signature request', { did: req.user?.did });
        if (!req.user?.did) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await createSignatureRequest(req, res);
    } catch (error) {
        handleRouteError(res, error as Error, 'Error creating signature request');
    }
});
//router.post('/:signatureId/sign', authMiddleware, signDocument);
router.post('/:signatureId/sign', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Signing document', { signatureId: req.params.signatureId, did: req.user?.did });
        if (!req.user?.did) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await signDocument(req, res);
    } catch (error) {
        handleRouteError(res, error as Error, `Error signing document ${req.params.signatureId}`);
    }
});
//router.get('/:documentId/verify', authMiddleware, verifyDocument);
router.get('/:documentId/verify', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Verifying document', { documentId: req.params.documentId, did: req.user?.did });
        if (!req.user?.did) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await verifyDocument(req, res);
    } catch (error) {
        handleRouteError(res, error as Error, `Error verifying document ${req.params.documentId}`);
    }
});
//router.get('/:documentId/status', authMiddleware, getDocumentStatus);
router.get('/:documentId/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Fetching document status', { documentId: req.params.documentId, did: req.user?.did });
        if (!req.user?.did) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await getDocumentStatus(req, res);
    } catch (error) {
        handleRouteError(res, error as Error, `Error fetching status for document ${req.params.documentId}`);
    }
});
//router.get('/pending', authMiddleware, getPendingSignatures);
router.get('/pending', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        logger.info('Fetching pending signatures', { did: req.user?.did });
        if (!req.user?.did) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await getPendingSignatures(req, res);
    } catch (error) {
        handleRouteError(res, error as Error, 'Error fetching pending signatures');
    }
});

router.post('/signature-request', authMiddleware, createSignatureRequest);
router.post('/:signatureId/sign', authMiddleware, signDocument);
router.get('/:signatureId/status', authMiddleware, getDocumentStatus);
router.get('/:signatureId/signed', authMiddleware, getSignedDocument);
router.get('/:documentId/verify', authMiddleware, verifyDocument);
  
export default router;