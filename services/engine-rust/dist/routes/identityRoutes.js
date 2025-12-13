import express from 'express';
import { getIdentity, listIdentities, deleteIdentity, updateIdentity, login } from '../api/identity.mjs';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
const router = express.Router();
/*router.post('/create', async (req, res) => {
  try {
    const result = await createIdentity();
    res.status(201).json(result);
  } catch (error) {
    logger.error('Error in identity creation route handler', { error });
    res.status(500).json({ error: 'Failed to create identity' });
  }
});*/
router.post('/login', async (req, res) => {
    try {
        const { did, proof, publicSignals } = req.body;
        if (!did) {
            logger.error('DID is required');
            return res.status(400).json({ error: 'DID is required' });
        }
        logger.info(`Login attempt for DID: ${did}`);
        logger.info('Received proof:', JSON.stringify(proof));
        logger.info('Received publicSignals:', JSON.stringify(publicSignals));
        const identity = await login(did, proof, publicSignals);
        if (!identity || !identity.did) {
            logger.error(`Login failed for DID: ${did}`);
            return res.status(401).json({ error: 'Login failed' });
        }
        const token = jwt.sign({ did: identity.did }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });
        logger.info(`Login successful for DID: ${did}`);
        res.json({
            message: 'Login successful',
            token,
            identity: {
                did: identity.did,
                publicKey: identity.publicKey,
                // Include other non-sensitive identity information here
            }
        });
    }
    catch (error) {
        logger.error('Error in login route handler', { error, did: req.body.did });
        res.status(401).json({ error: 'Login failed' });
    }
});
router.get('/:did', async (req, res) => {
    try {
        const identity = await getIdentity(req.params.did);
        res.json(identity);
    }
    catch (error) {
        logger.error('Error in get identity route handler', { error, did: req.params.did });
        res.status(404).json({ error: 'Identity not found' });
    }
});
router.get('/', async (req, res) => {
    try {
        const identities = await listIdentities();
        res.json(identities);
    }
    catch (error) {
        logger.error('Error in list identities route handler', { error });
        res.status(500).json({ error: 'Failed to list identities' });
    }
});
router.delete('/:did', async (req, res) => {
    try {
        await deleteIdentity(req.params.did);
        res.status(204).send();
    }
    catch (error) {
        logger.error('Error in delete identity route handler', { error, did: req.params.did });
        res.status(500).json({ error: 'Failed to delete identity' });
    }
});
router.put('/:did', async (req, res) => {
    try {
        const updatedIdentity = await updateIdentity(req.params.did, req.body);
        res.json(updatedIdentity);
    }
    catch (error) {
        logger.error('Error in update identity route handler', { error, did: req.params.did });
        res.status(500).json({ error: 'Failed to update identity' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { did, proof, publicSignals } = req.body;
        if (!did) {
            logger.error('DID is required');
            return res.status(400).json({ error: 'DID is required' });
        }
        logger.info(`Login attempt for DID: ${did}`);
        const identity = await login(did, proof, publicSignals);
        if (!identity || !identity.did) {
            logger.error(`Login successful but DID not returned for ${did}`);
            return res.status(401).json({ error: 'Login failed' });
        }
        const token = jwt.sign({ did: identity.did }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });
        logger.info(`Login successful for DID: ${did}`);
        res.json({
            message: 'Login successful',
            token,
            identity: {
                did: identity.did,
                publicKey: identity.publicKey,
                // Include other non-sensitive identity information here
            }
        });
    }
    catch (error) {
        logger.error('Error in login route handler', { error });
        res.status(401).json({ error: 'Login failed' });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.json({ message: 'Logout successful' });
});
export default router;
