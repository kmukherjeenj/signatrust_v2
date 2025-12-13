import express from 'express';
//import { DocumentService } from '../services/DocumentService.js';
//import { SolanaDocumentService } from '../services/SolanaDocumentService.js';
import logger from '../utils/logger.js';
const router = express.Router();
//const documentService = new DocumentService();
//const solanaDocumentService = new SolanaDocumentService();
router.post('/hash', async (req, res, next) => {
    try {
        const { document } = req.body;
        // Implement document hashing logic here
        const hash = 'placeholder_hash'; // Replace with actual hashing logic
        res.json({ hash });
    }
    catch (error) {
        logger.error('Error in POST /document/hash', { error, body: req.body });
        next(error);
    }
});
router.post('/store', async (req, res, next) => {
    try {
        const { userCloudStorage, documentHash } = req.body;
        // Implement document reference storage logic here
        const documentId = 'placeholder_id'; // Replace with actual storage logic
        res.status(201).json({ documentId });
    }
    catch (error) {
        logger.error('Error in POST /document/store', { error, body: req.body });
        next(error);
    }
});
router.get('/:documentId', async (req, res, next) => {
    try {
        // Implement document reference retrieval logic here
        const documentReference = { id: req.params.documentId, hash: 'placeholder_hash' }; // Replace with actual retrieval logic
        res.json(documentReference);
    }
    catch (error) {
        logger.error('Error in GET /document/:documentId', { error, documentId: req.params.documentId });
        next(error);
    }
});
// New Solana-specific routes
router.post('/store-on-solana', async (req, res, next) => {
    try {
        const { documentHash } = req.body;
        //const transaction = await solanaDocumentService.storeDocumentHashOnChain(documentHash);
        //res.status(201).json({ transaction });
    }
    catch (error) {
        logger.error('Error in POST /document/store-on-solana', { error, body: req.body });
        next(error);
    }
});
router.get('/verify-on-solana/:documentHash', async (req, res, next) => {
    try {
        //const isVerified = await solanaDocumentService.verifyDocumentHashOnChain(req.params.documentHash);
        //res.json({ isVerified });
    }
    catch (error) {
        logger.error('Error in GET /document/verify-on-solana/:documentHash', { error, documentHash: req.params.documentHash });
        next(error);
    }
});
export default router;
