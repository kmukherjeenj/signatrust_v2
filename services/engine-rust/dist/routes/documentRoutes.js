import express from 'express';
import { uploadDocument, getDocument, createSignatureRequest, signDocument, verifyDocument, getDocuments, getDocumentStatus, getSignedDocument, getPendingSignatures } from '../middleware/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
const router = express.Router();
// Helper function for error handling
const handleRouteError = (res, error, errorMessage) => {
    logger.error(errorMessage, { error: error.message, stack: error.stack });
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'An unexpected error occurred' });
};
//router.get('/', authMiddleware, getDocuments);
router.get('/', authMiddleware, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        //const documents = await getDocuments(req.user.did);
        const documents = await getDocuments(req.user.did);
        res.json(documents);
    }
    catch (error) {
        handleRouteError(res, error, 'Error fetching documents');
    }
});
//router.post('/upload', authMiddleware, uploadDocument);
router.post('/upload', authMiddleware, async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const result = await uploadDocument(req, res);
        res.status(201).json(result);
    }
    catch (error) {
        handleRouteError(res, error, 'Error uploading document');
    }
});
//router.get('/:documentId', authMiddleware, getDocument);
router.get('/:documentId', authMiddleware, async (req, res) => {
    var _a, _b;
    try {
        logger.info('Fetching document', { documentId: req.params.documentId, did: (_a = req.user) === null || _a === void 0 ? void 0 : _a.did });
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await getDocument(req, res);
    }
    catch (error) {
        handleRouteError(res, error, `Error fetching document ${req.params.documentId}`);
    }
});
//router.post('/signature-request', authMiddleware, createSignatureRequest);
router.post('/signature-request', authMiddleware, async (req, res) => {
    var _a, _b;
    try {
        logger.info('Creating signature request', { did: (_a = req.user) === null || _a === void 0 ? void 0 : _a.did });
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await createSignatureRequest(req, res);
    }
    catch (error) {
        handleRouteError(res, error, 'Error creating signature request');
    }
});
//router.post('/:signatureId/sign', authMiddleware, signDocument);
router.post('/:signatureId/sign', authMiddleware, async (req, res) => {
    var _a, _b;
    try {
        logger.info('Signing document', { signatureId: req.params.signatureId, did: (_a = req.user) === null || _a === void 0 ? void 0 : _a.did });
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await signDocument(req, res);
    }
    catch (error) {
        handleRouteError(res, error, `Error signing document ${req.params.signatureId}`);
    }
});
//router.get('/:documentId/verify', authMiddleware, verifyDocument);
router.get('/:documentId/verify', authMiddleware, async (req, res) => {
    var _a, _b;
    try {
        logger.info('Verifying document', { documentId: req.params.documentId, did: (_a = req.user) === null || _a === void 0 ? void 0 : _a.did });
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await verifyDocument(req, res);
    }
    catch (error) {
        handleRouteError(res, error, `Error verifying document ${req.params.documentId}`);
    }
});
//router.get('/:documentId/status', authMiddleware, getDocumentStatus);
router.get('/:documentId/status', authMiddleware, async (req, res) => {
    var _a, _b;
    try {
        logger.info('Fetching document status', { documentId: req.params.documentId, did: (_a = req.user) === null || _a === void 0 ? void 0 : _a.did });
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await getDocumentStatus(req, res);
    }
    catch (error) {
        handleRouteError(res, error, `Error fetching status for document ${req.params.documentId}`);
    }
});
//router.get('/pending', authMiddleware, getPendingSignatures);
router.get('/pending', authMiddleware, async (req, res) => {
    var _a, _b;
    try {
        logger.info('Fetching pending signatures', { did: (_a = req.user) === null || _a === void 0 ? void 0 : _a.did });
        if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.did)) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await getPendingSignatures(req, res);
    }
    catch (error) {
        handleRouteError(res, error, 'Error fetching pending signatures');
    }
});
router.post('/signature-request', authMiddleware, createSignatureRequest);
router.post('/:signatureId/sign', authMiddleware, signDocument);
router.get('/:signatureId/status', authMiddleware, getDocumentStatus);
router.get('/:signatureId/signed', authMiddleware, getSignedDocument);
router.get('/:documentId/verify', authMiddleware, verifyDocument);
export default router;
