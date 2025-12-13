import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import * as crypto from 'crypto';
import logger from '../utils/logger.js';
export class SecureEnclaveService {
    constructor() {
        this.enclave = new Map();
    }
    async storeKeyPair(did, keyPair) {
        try {
            const encryptedKey = this.encryptKey(keyPair.secretKey);
            this.enclave.set(did, encryptedKey);
            logger.info(`KeyPair stored for DID: ${did}`);
        }
        catch (error) {
            logger.error('Error storing keyPair in secure enclave:', error);
            throw new Error('Failed to store keyPair in secure enclave');
        }
    }
    async retrieveKeyPair(did) {
        try {
            const encryptedKey = this.enclave.get(did);
            if (!encryptedKey) {
                logger.warn(`KeyPair not found for DID: ${did}`);
                return null;
            }
            const decryptedKey = this.decryptKey(encryptedKey);
            logger.info(`KeyPair retrieved for DID: ${did}`);
            return Keypair.fromSecretKey(decryptedKey);
        }
        catch (error) {
            logger.error('Error retrieving keyPair from secure enclave:', error);
            throw new Error('Failed to retrieve keyPair from secure enclave');
        }
    }
    async signChallenge(did, challenge) {
        try {
            const keyPair = await this.retrieveKeyPair(did);
            if (!keyPair) {
                logger.warn(`Cannot sign challenge: KeyPair not found for DID: ${did}`);
                return null;
            }
            const messageUint8 = new TextEncoder().encode(challenge);
            const signature = nacl.sign.detached(messageUint8, keyPair.secretKey);
            logger.info(`Challenge signed for DID: ${did}`);
            return signature;
        }
        catch (error) {
            logger.error('Error signing challenge with key from secure enclave:', error);
            throw new Error('Failed to sign challenge with key from secure enclave');
        }
    }
    encryptKey(key) {
        // In a real implementation, this would use hardware-backed encryption
        // This is a simplified version for demonstration purposes
        const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCLAVE_SECRET || 'default-secret');
        let encrypted = cipher.update(Buffer.from(key));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted;
    }
    decryptKey(encryptedKey) {
        // In a real implementation, this would use hardware-backed decryption
        // This is a simplified version for demonstration purposes
        const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCLAVE_SECRET || 'default-secret');
        let decrypted = decipher.update(encryptedKey);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return new Uint8Array(decrypted);
    }
}
