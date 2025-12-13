import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import logger from '../utils/logger.js';
import { createHash } from "crypto";

export class SolanaDIDService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(rpcUrl: string, programId: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.programId = new PublicKey(programId);
  }

  // Helper method to get keypair from DID
  private getKeypairFromDID(did: string): Keypair {
    // This is a placeholder. In a real implementation, you would need to securely retrieve
    // the private key associated with this DID. This might involve:
    // 1. Fetching from a secure key management system
    // 2. Asking the user to provide their private key
    // 3. Using a deterministic derivation method based on some user-provided secret
    // The method you choose depends on your security model and user experience requirements.
    
    // For demonstration purposes, we're creating a new keypair.
    // DO NOT use this in production!
    return Keypair.generate();
  }

  async signDocument(did: string, documentId: string, signature: string): Promise<string> {
    try {
      const keypair = this.getKeypairFromDID(did);
      
      // Derive documentHash from documentId if needed
      const documentHash = createHash('sha256').update(documentId).digest('hex');

      const metadata = {
        documentId,
        documentHash,
        signature,
        timestamp: new Date().toISOString(),
        signatureMethod: 'Solana blockchain transaction',
        signerDid: did,
        intent: 'To sign the document electronically',
        consentToElectronic: true,
      };
      const data = Buffer.from(JSON.stringify(metadata));

      const instruction = new TransactionInstruction({
        keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
        programId: this.programId,
        data: Buffer.from([1, ...data]) // 1 is the instruction index for signing document
      });

      const transaction = new Transaction().add(instruction);
      const txSignature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [keypair]
      );

      logger.info(`Document signed on Solana blockchain`, { did, documentId, documentHash, txSignature });
      return txSignature;
    } catch (error) {
      logger.error('Failed to sign document on Solana blockchain', { did, documentId, error });
      throw new Error(`Failed to sign document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createDID(payerKeypair: Keypair): Promise<{ did: string; publicKey: string }> {
    const newKeypair = Keypair.generate();
    const did = `did:sol:${newKeypair.publicKey.toBase58()}`;

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payerKeypair.publicKey,
        newAccountPubkey: newKeypair.publicKey,
        lamports: await this.connection.getMinimumBalanceForRentExemption(0),
        space: 0,
        programId: this.programId,
      })
    );

    await sendAndConfirmTransaction(this.connection, transaction, [payerKeypair, newKeypair]);

    return { did, publicKey: newKeypair.publicKey.toBase58() };
  }

  async resolveDID(did: string): Promise<any> {
    const publicKey = new PublicKey(did.split(':')[2]);
    const accountInfo = await this.connection.getAccountInfo(publicKey);
    if (!accountInfo) {
      throw new Error('DID not found');
    }
    // Implement parsing of account data to DID Document
    return { /* DID Document structure */ };
  }

  async updateDID(did: string, payerKeypair: Keypair, updateData: Buffer): Promise<string> {
    const publicKey = new PublicKey(did.split(':')[2]);
    const transaction = new Transaction().add(
      // Implement your update instruction here
    );

    const signature = await sendAndConfirmTransaction(this.connection, transaction, [payerKeypair]);
    return signature;
  }

  async deactivateDID(did: string, payerKeypair: Keypair): Promise<string> {
    const publicKey = new PublicKey(did.split(':')[2]);
    const transaction = new Transaction().add(
      // Implement your deactivate instruction here
    );

    const signature = await sendAndConfirmTransaction(this.connection, transaction, [payerKeypair]);
    return signature;
  }

  getProvider() {
    // Implement provider logic
  }

  async storeDocumentHash(did: string, documentHash: string): Promise<string> {
    const keypair = this.getKeypairFromDID(did);
    const data = Buffer.from(documentHash);

    const instruction = new TransactionInstruction({
      keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
      programId: this.programId,
      data: Buffer.from([0, ...data]) // 0 is the instruction index for storing document hash
    });

    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [keypair]
    );
    return signature;
  }

  async verifyDocumentHash(documentHash: string): Promise<boolean> {
    // This is a placeholder. The actual implementation would depend on how you've structured your Solana program.
    // You might need to fetch the account data and check if the document hash exists.
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [
        {
          memcmp: {
            offset: 1, // Assuming the first byte is the instruction index
            bytes: documentHash
          }
        }
      ]
    });
    return accounts.length > 0;
  }
}