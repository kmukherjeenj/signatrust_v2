import { IdentityService } from '../services/identity.js';
import { ZKProofService } from '../services/ZKProofService.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
const identityService = new IdentityService();
const zkProofService = new ZKProofService();
const getEnv = (key, defaultValue) => {
    const value = process.env[key];
    if (value === undefined) {
        console.warn(`Warning: ${key} is not set in the environment variables. Using default value.`);
        return defaultValue;
    }
    return value;
};
export const createIdentity = async () => {
    try {
        const { did, publicKey } = await identityService.createIdentity();
        const message = crypto.randomBytes(32).toString('hex');
        const signature = await signMessage(message, publicKey);
        const { proof, publicSignals } = await zkProofService.generateAuthProof(publicKey, signature, message);
        return { did, publicKey, proof, publicSignals, message };
    }
    catch (error) {
        logger.error('Error in createIdentity', { error });
        throw error;
    }
};
async function signMessage(message, publicKeyString) {
    try {
        // Convert the message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);
        // Derive the keypair from the public key
        const publicKey = new PublicKey(publicKeyString);
        const keypair = Keypair.generate();
        keypair.publicKey.toBuffer().set(publicKey.toBuffer());
        // Sign the message
        const signatureBytes = nacl.sign.detached(messageBytes, keypair.secretKey);
        // Convert the signature to a base58 string
        const signature = bs58.encode(signatureBytes);
        return signature;
    }
    catch (error) {
        console.error('Error signing message:', error);
        throw new Error('Failed to sign message');
    }
}
export const getIdentity = async (did) => {
    try {
        return await identityService.getIdentity(did);
    }
    catch (error) {
        logger.error('Error in getIdentity', { error, did });
        throw error;
    }
};
export const listIdentities = async () => {
    try {
        return await identityService.listIdentities();
    }
    catch (error) {
        logger.error('Error in listIdentities', { error });
        throw error;
    }
};
export const deleteIdentity = async (did) => {
    try {
        return await identityService.deleteIdentity(did);
    }
    catch (error) {
        logger.error('Error in deleteIdentity', { error, did });
        throw error;
    }
};
export const updateIdentity = async (did, updateData) => {
    try {
        return await identityService.updateIdentity(did, updateData);
    }
    catch (error) {
        logger.error('Error in updateIdentity', { error, did });
        throw error;
    }
};
export const login = async (did, proof, publicSignals) => {
    try {
        logger.info(`Attempting to login with DID: ${did}`);
        logger.info('Received proof:', JSON.stringify(proof));
        logger.info('Received publicSignals:', JSON.stringify(publicSignals));
        const isValidProof = await zkProofService.verifyProof(proof, publicSignals);
        if (!isValidProof) {
            logger.error(`Invalid proof for DID: ${did}`);
            throw new Error('Invalid proof');
        }
        // Extract public key from DID
        const publicKey = new PublicKey(did.split(':')[2]);
        // Retrieve account info
        const connection = new Connection(getEnv('SOLANA_RPC_URL', 'https://api.devnet.solana.com'));
        const accountInfo = await connection.getAccountInfo(publicKey);
        if (!accountInfo) {
            logger.error(`Account not found for DID: ${did}`);
            throw new Error('Account not found');
        }
        // Retrieve the identity
        const identity = await identityService.login(did, proof, publicSignals);
        if (!identity) {
            logger.error(`Identity not found for DID: ${did}`);
            throw new Error('Identity not found');
        }
        logger.info(`Login successful for DID: ${did}`);
        return identity;
    }
    catch (error) {
        logger.error('Error in login', { error, did });
        throw error;
    }
};
