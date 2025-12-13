import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import logger from '../utils/logger.js';
import { throwAppError } from '../utils/errors.js';
import dotenv from 'dotenv';
import { ZKProofService } from './ZKProofService.js';
import crypto from 'crypto';
import nacl from 'tweetnacl';
dotenv.config();
export class IdentityService {
    constructor() {
        this.zkProofService = new ZKProofService();
        // Ensure RPC URL is set
        //this.rpcUrl = process.env.SOLANA_RPC_URL!;
        this.rpcUrl = 'https://api.devnet.solana.com';
        if (!this.rpcUrl) {
            throw new Error('SOLANA_RPC_URL environment variable is not set');
        }
        // Ensure Program ID is set and valid
        const programIdStr = process.env.SOLANA_PROGRAM_ID;
        if (!programIdStr) {
            throw new Error('SOLANA_PROGRAM_ID environment variable is not set');
        }
        try {
            this.programId = new PublicKey(programIdStr);
        }
        catch (e) {
            throw new Error('Invalid SOLANA_PROGRAM_ID');
        }
        // Ensure Payer Public Key is set and valid
        const payerPublicKeyStr = process.env.SOLANA_FEE_PAYER;
        if (!payerPublicKeyStr) {
            throw new Error('SOLANA_FEE_PAYER environment variable is not set');
        }
        try {
            this.payerPublicKey = new PublicKey(payerPublicKeyStr);
        }
        catch (e) {
            throw new Error('Invalid SOLANA_FEE_PAYER');
        }
        // Ensure Payer Private Key is set and valid
        const payerPrivateKeyStr = process.env.SOLANA_PAYER_PRIVATE_KEY;
        if (!payerPrivateKeyStr) {
            throw new Error('SOLANA_PAYER_PRIVATE_KEY environment variable is not set');
        }
        try {
            console.log('Parsing SOLANA_PAYER_PRIVATE_KEY:', payerPrivateKeyStr);
            const payerPrivateKeyBytes = JSON.parse(payerPrivateKeyStr);
            console.log('Parsed payerPrivateKeyBytes:', payerPrivateKeyBytes);
            if (!Array.isArray(payerPrivateKeyBytes) || payerPrivateKeyBytes.some(isNaN)) {
                throw new Error('Invalid SOLANA_PAYER_PRIVATE_KEY format');
            }
            this.payerKeypair = Keypair.fromSecretKey(new Uint8Array(payerPrivateKeyBytes));
        }
        catch (e) {
            console.error('Error parsing SOLANA_PAYER_PRIVATE_KEY:', e);
            throw new Error('Invalid SOLANA_PAYER_PRIVATE_KEY');
        }
        // Initialize Solana connection
        this.connection = new Connection(this.rpcUrl, 'confirmed');
        console.log('Identity service initialized with the following configuration:');
        console.log('RPC URL:', this.rpcUrl);
        console.log('Program ID:', this.programId.toBase58());
        console.log('Payer Keypair:', this.payerKeypair.publicKey.toBase58());
    }
    async createIdentity() {
        try {
            // Generate a new keypair for the new identity
            const newKeypair = Keypair.generate();
            const did = `did:sol:${newKeypair.publicKey.toBase58()}`;
            const publicKey = newKeypair.publicKey.toBase58();
            // Create a transaction to create the new account
            const transaction = new Transaction().add(SystemProgram.createAccount({
                fromPubkey: this.payerKeypair.publicKey,
                newAccountPubkey: newKeypair.publicKey,
                lamports: await this.connection.getMinimumBalanceForRentExemption(0),
                space: 0,
                programId: this.programId,
            }));
            // Fetch the latest blockhash and assign it to the transaction
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.payerKeypair.publicKey;
            console.log('Transaction before signing:', transaction);
            // Sign the transaction with both the payer's keypair and the new keypair
            transaction.sign(this.payerKeypair, newKeypair);
            console.log('Transaction after signing:', transaction);
            // Send and confirm the transaction
            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.payerKeypair, newKeypair]);
            // Generate a random message for ZKProof
            const challenge = crypto.randomBytes(32).toString('hex');
            // Sign the message
            const messageUint8 = new TextEncoder().encode(challenge);
            const signatureZK = nacl.sign.detached(messageUint8, newKeypair.secretKey);
            // Generate ZKProof
            const { proof, publicSignals } = await this.zkProofService.generateAuthProof(publicKey, Buffer.from(signature).toString('hex'), challenge);
            logger.info(`DID created: ${did}, Transaction signature: ${signature}`);
            return {
                did,
                publicKey,
                proof,
                publicSignals,
                challenge
            };
        }
        catch (error) {
            logger.error('Failed to create identity', { error });
            throw throwAppError(`Failed to create identity: ${error instanceof Error ? error.message : String(error)}`, 500);
        }
    }
    async getIdentity(did) {
        try {
            const publicKey = new PublicKey(did.split(':')[2]);
            logger.info(`Fetching account info for publicKey: ${publicKey.toBase58()}`);
            const accountInfo = await this.connection.getAccountInfo(publicKey);
            if (!accountInfo) {
                throw new Error('DID not found');
            }
            logger.info(`Fetched account info for publicKey: ${publicKey.toBase58()}`);
            // Parse accountInfo.data to extract DID document
            // This depends on how you structure your data on-chain
            return {
                did,
                publicKey: publicKey.toBase58(), /* other DID document fields */
                data: accountInfo.data
            };
        }
        catch (error) {
            logger.error('Failed to retrieve identity', { error, did });
            throw throwAppError('Failed to retrieve identity', 404);
        }
    }
    async listIdentities() {
        // This method will need to be implemented based on how you store/index DIDs on Solana
        // For now, it returns an empty array
        return [];
    }
    async deleteIdentity(did) {
        // Implement logic to mark a DID as inactive on Solana
        // This is a placeholder implementation
        logger.info('Identity deletion not implemented');
        return true;
    }
    async updateIdentity(did, updateData) {
        // Implement logic to update a DID on Solana
        // This is a placeholder implementation
        logger.info('Identity update not implemented');
        return { did, ...updateData };
    }
    async checkBalance() {
        const balance = await this.connection.getBalance(this.payerKeypair.publicKey);
        console.log(`Payer balance: ${balance / LAMPORTS_PER_SOL} SOL`);
        return balance / LAMPORTS_PER_SOL;
    }
    async sendTransaction() {
        const newKeypair = Keypair.generate();
        console.log("New keypair public key:", newKeypair.publicKey.toBase58());
        const transaction = new Transaction().add(SystemProgram.transfer({
            fromPubkey: this.payerKeypair.publicKey,
            toPubkey: newKeypair.publicKey,
            lamports: LAMPORTS_PER_SOL / 100,
        }));
        const { blockhash } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = this.payerKeypair.publicKey;
        console.log("Transaction created:", transaction);
        try {
            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.payerKeypair]);
            console.log("Transaction sent successfully. Signature:", signature);
        }
        catch (error) {
            console.error("Error sending transaction:", error);
        }
    }
    async verifyIdentity(did, proof, publicSignals, challenge) {
        return this.zkProofService.verifyAuthProof(proof, publicSignals, challenge);
    }
    async login(did, proof, publicSignals) {
        try {
            const isValid = await this.zkProofService.verifyProof(proof, publicSignals);
            if (!isValid) {
                throw new Error('Invalid proof');
            }
            logger.info(`Fetching identity for DID: ${did}`);
            const identity = await this.getIdentity(did);
            if (!identity) {
                throw new Error('DID not found');
            }
            logger.info(`Fetched identity for DID: ${did}`);
            return identity;
        }
        catch (error) {
            logger.error('Error in login method', { error, did });
            throw error;
        }
    }
}
