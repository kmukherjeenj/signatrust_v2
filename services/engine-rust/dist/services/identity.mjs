import logger from '../config/logger.js';
import { throwAppError } from '../utils/errors.js';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
export class IdentityService {
    constructor(agent) {
        this.agent = agent;
        this.verifyEnvironment();
        const solanaRpcUrl = process.env.SOLANA_RPC_URL;
        if (!solanaRpcUrl) {
            logger.error('SOLANA_RPC_URL environment variable is not set');
            throw new Error('SOLANA_RPC_URL environment variable is not set');
        }
        if (!solanaRpcUrl.startsWith('http://') && !solanaRpcUrl.startsWith('https://')) {
            logger.error(`Invalid SOLANA_RPC_URL: ${solanaRpcUrl}`);
            throw new Error(`Invalid SOLANA_RPC_URL: ${solanaRpcUrl}`);
        }
        logger.info(`Initializing Solana connection with URL: ${solanaRpcUrl}`);
        this.connection = new Connection(solanaRpcUrl, 'confirmed');
    }
    verifyKeypair(privateKeyString, expectedPublicKey) {
        try {
            const privateKey = Uint8Array.from(JSON.parse(privateKeyString));
            const keypair = Keypair.fromSecretKey(privateKey);
            return keypair.publicKey.toBase58() === expectedPublicKey;
        }
        catch (error) {
            logger.error('Error verifying keypair:', error);
            return false;
        }
    }
    verifyEnvironment() {
        const requiredEnvVars = [
            'SOLANA_RPC_URL',
            'SOLANA_PROGRAM_ID',
            'SOLANA_KEYPAIR_PATH',
            'SOLANA_FEE_PAYER',
            'SOLANA_FEE_PAYER_PRIVATE_KEY'
        ];
        requiredEnvVars.forEach(envVar => {
            if (!process.env[envVar]) {
                throw new Error(`Missing environment variable: ${envVar}`);
            }
        });
        const privateKey = Uint8Array.from(JSON.parse(process.env.SOLANA_FEE_PAYER_PRIVATE_KEY));
        const keypair = Keypair.fromSecretKey(privateKey);
        if (keypair.publicKey.toBase58() !== process.env.SOLANA_FEE_PAYER) {
            throw new Error('SOLANA_FEE_PAYER does not match the public key derived from SOLANA_FEE_PAYER_PRIVATE_KEY');
        }
        logger.info('Environment verified successfully');
    }
    async createIdentity(args = { provider: 'did:sol' }) {
        try {
            logger.info('Starting createIdentity', { args });
            // Verify environment variables
            const requiredEnvVars = ['SOLANA_FEE_PAYER', 'SOLANA_PROGRAM_ID', 'SOLANA_FEE_PAYER_PRIVATE_KEY'];
            requiredEnvVars.forEach(v => {
                if (!process.env[v]) {
                    logger.error(`Missing environment variable: ${v}`);
                    throw new Error(`Missing environment variable: ${v}`);
                }
            });
            // Verify keypair
            const isKeypairValid = this.verifyKeypair(process.env.SOLANA_FEE_PAYER_PRIVATE_KEY, process.env.SOLANA_FEE_PAYER);
            logger.info('Keypair verification result:', { isValid: isKeypairValid });
            if (!isKeypairValid) {
                throw new Error('Invalid keypair');
            }
            const identity = await this.agent.didManagerCreate(args);
            logger.info('Solana identity created:', { did: identity.did });
            const newKeypair = Keypair.generate();
            const payerKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SOLANA_FEE_PAYER_PRIVATE_KEY)));
            logger.info('Payer public key:', payerKeypair.publicKey.toBase58());
            const transaction = new Transaction().add(SystemProgram.createAccount({
                fromPubkey: payerKeypair.publicKey,
                newAccountPubkey: newKeypair.publicKey,
                lamports: await this.connection.getMinimumBalanceForRentExemption(0),
                space: 0,
                programId: new PublicKey(process.env.SOLANA_PROGRAM_ID)
            }));
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = payerKeypair.publicKey;
            transaction.sign(payerKeypair, newKeypair);
            if (!transaction.verifySignatures()) {
                logger.error('Transaction signature verification failed');
                throw new Error('Transaction signature verification failed');
            }
            logger.info('About to send transaction', {
                fromPubkey: payerKeypair.publicKey.toBase58(),
                newAccountPubkey: newKeypair.publicKey.toBase58(),
                programId: process.env.SOLANA_PROGRAM_ID,
                recentBlockhash: transaction.recentBlockhash,
            });
            const signature = await this.connection.sendRawTransaction(transaction.serialize());
            await this.connection.confirmTransaction(signature);
            logger.info('Transaction sent and confirmed', { signature });
            const newKey = {
                type: 'Ed25519',
                publicKeyHex: newKeypair.publicKey.toBuffer().toString('hex'),
                kid: `solana-${newKeypair.publicKey.toBase58()}`,
                kms: 'local',
            };
            await this.agent.didManagerAddKey({
                did: identity.did,
                key: newKey,
            });
            return identity;
        }
        catch (error) {
            logger.error('Error in createIdentity', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            throw error;
        }
    }
    async getIdentity(args) {
        try {
            const identity = await this.agent.didManagerGet(args);
            logger.info('Identity retrieved:', { did: identity.did });
            return identity;
        }
        catch (error) {
            logger.error('Failed to retrieve identity', { error, did: args.did });
            throw throwAppError('Failed to retrieve identity', 404);
        }
    }
    async listIdentities(args = {}) {
        try {
            const identities = await this.agent.didManagerFind(args);
            logger.info(`Retrieved ${identities.length} identities`);
            return identities;
        }
        catch (error) {
            logger.error('Failed to list identities', { error });
            throw throwAppError('Failed to list identities', 500);
        }
    }
    async deleteIdentity(args) {
        try {
            await this.agent.didManagerDelete(args);
            logger.info('Identity deleted:', { did: args.did });
            return true;
        }
        catch (error) {
            logger.error('Failed to delete identity', { error, did: args.did });
            throw throwAppError('Failed to delete identity', 500);
        }
    }
    async updateIdentity(args) {
        try {
            const updatedIdentity = await this.agent.didManagerUpdate(args);
            logger.info('Identity updated:', { did: args.did });
            return updatedIdentity;
        }
        catch (error) {
            logger.error('Failed to update identity', { error, did: args.did });
            throw throwAppError('Failed to update identity', 500);
        }
    }
    // Placeholder for future implementation of persisting DID to Solana
    async persistDIDToSolana(did) {
        // This method will be implemented in the future
        logger.info('Persist DID to Solana: Not implemented yet');
    }
    async login(did) {
        logger.info('Attempting login for DID:', { did });
        try {
            const identity = await this.getIdentity({ did });
            logger.info('Login successful for identity:', { did });
            return identity;
        }
        catch (error) {
            logger.error('Login failed for identity', { error, did });
            throw throwAppError('Login failed', 401);
        }
    }
    // Placeholder for future implementation of zero-knowledge proof generation
    async generateZKProof(did, claim) {
        // This method will be implemented in the future
        logger.info('Generate ZK Proof: Not implemented yet');
        return 'ZK Proof placeholder';
    }
    // Placeholder for future implementation of wallet storage
    async storeInWallet(did, walletType) {
        // This method will be implemented in the future
        logger.info('Store in Wallet: Not implemented yet');
        return true;
    }
}
