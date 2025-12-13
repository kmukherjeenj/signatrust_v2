import express from 'express';
//import { SolanaSignatureService } from '../services/SolanaSignatureService';
import { ZKProofService } from '../services/ZKProofService.js';
import logger from '../utils/logger.js';

const router = express.Router();
//const solanaSignatureService = new SolanaSignatureService();
const zkProofService = new ZKProofService();

router.post('/sign', async (req, res, next) => {
  try {
    const { did, document } = req.body;
    // Implement document signing logic here
    const signedDocument = { ...document, signature: 'placeholder_signature' }; // Replace with actual signing logic
    res.status(201).json(signedDocument);
  } catch (error) {
    logger.error('Error in POST /signature/sign', { error, body: req.body });
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { signedDocument } = req.body;
    // Implement signature verification logic here
    const isValid = true; // Replace with actual verification logic
    res.json({ isValid });
  } catch (error) {
    logger.error('Error in POST /signature/verify', { error, body: req.body });
    next(error);
  }
});

router.post('/zk-proof', async (req, res, next) => {
  try {
    const { privateData, publicData } = req.body;
    const proof = await zkProofService.generateProof(privateData, publicData);
    res.status(201).json(proof);
  } catch (error) {
    logger.error('Error in POST /signature/zk-proof', { error, body: req.body });
    next(error);
  }
});

router.post('/verify-zk-proof', async (req, res, next) => {
  try {
    const { proof, publicData } = req.body;
    const isValid = await zkProofService.verifyProof(proof, publicData);
    res.json({ isValid });
  } catch (error) {
    logger.error('Error in POST /signature/verify-zk-proof', { error, body: req.body });
    next(error);
  }
});

export default router;