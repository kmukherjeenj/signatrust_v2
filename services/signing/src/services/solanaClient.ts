import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import { serialize as borshSerialize, deserialize as borshDeserialize } from 'borsh';
import { getKeypairManager, KeypairManager } from './keypairManager.js';
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Document status on-chain
 */
export enum DocumentStatus {
  Pending = 0,
  Signed = 1,
  Completed = 2,
  Cancelled = 3,  // Added for session management
}

/**
 * On-chain document account structure
 */
export interface DocumentAccount {
  documentHash: Uint8Array;  // 32 bytes
  status: DocumentStatus;
  signers: PublicKey[];
  signatures: Signature[];
  createdAt: bigint;
  updatedAt: bigint;
  creator: PublicKey;
}

/**
 * On-chain signature structure
 */
export interface Signature {
  signer: PublicKey;
  signature: Uint8Array;  // 64 bytes
  timestamp: bigint;
}

/**
 * Instruction discriminators
 */
enum InstructionType {
  CreateDocument = 0,
  SignDocument = 1,
  UpdateStatus = 2,
}

/**
 * Load fee payer keypair from file or environment
 */
function loadFeePayerKeypair(): Keypair {
  // Try environment variable first (base64 encoded secret key)
  const envKey = process.env.SOLANA_FEE_PAYER_SECRET;
  if (envKey) {
    const secretKey = Buffer.from(envKey, 'base64');
    return Keypair.fromSecretKey(secretKey);
  }

  // Try default Solana CLI keypair location
  const defaultPath = join(homedir(), '.config', 'solana', 'id.json');
  if (existsSync(defaultPath)) {
    const keyData = JSON.parse(readFileSync(defaultPath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(keyData));
  }

  throw new Error('No fee payer keypair found. Set SOLANA_FEE_PAYER_SECRET or ensure ~/.config/solana/id.json exists');
}

/**
 * Solana program client for document signing
 */
export class SolanaDocumentClient {
  private connection: Connection;
  private programId: PublicKey;
  private keypairManager: KeypairManager;
  private feePayerKeypair: Keypair;

  constructor(rpcUrl: string, programId: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.programId = new PublicKey(programId);
    this.keypairManager = getKeypairManager();
    this.feePayerKeypair = loadFeePayerKeypair();
    console.log(`Fee payer: ${this.feePayerKeypair.publicKey.toBase58()}`);
  }

  /**
   * Calculate the size needed for a document account
   */
  private calculateDocumentAccountSize(numSigners: number): number {
    // document_hash: 32 bytes
    // status: 1 byte
    // signers vec length: 4 bytes + (32 bytes * numSigners)
    // signatures vec length: 4 bytes (initially empty)
    // created_at: 8 bytes
    // updated_at: 8 bytes
    // creator: 32 bytes

    const baseSize = 32 + 1 + 4 + 4 + 8 + 8 + 32;
    const signersSize = 32 * numSigners;
    // Reserve space for all signatures (each is 32 + 64 + 8 = 104 bytes)
    const signaturesSize = 104 * numSigners;

    return baseSize + signersSize + signaturesSize + 256; // Extra buffer
  }

  /**
   * Create a new document on-chain
   * @param documentHash SHA-256 hash of the document
   * @param signerDIDs Array of DIDs authorized to sign
   * @param creatorDID DID of the document creator
   * @returns Document account public key and transaction signature
   */
  async createDocument(
    documentHash: string,
    signerDIDs: string[],
    creatorDID: string
  ): Promise<{ documentAccount: PublicKey; signature: string }> {
    // Get creator keypair
    const creatorKeypair = await this.keypairManager.getKeypairByDID(creatorDID);
    if (!creatorKeypair) {
      throw new Error(`No keypair found for creator DID: ${creatorDID}`);
    }

    // Convert DIDs to public keys by looking up keypairs
    const signerPubkeys: PublicKey[] = [];
    for (const did of signerDIDs) {
      const keypair = await this.keypairManager.getKeypairByDID(did);
      if (!keypair) {
        throw new Error(`No keypair found for signer DID: ${did}`);
      }
      signerPubkeys.push(keypair.publicKey);
    }

    // Convert hash to bytes
    const hashBytes = Buffer.from(documentHash, 'hex');
    if (hashBytes.length !== 32) {
      throw new Error('Document hash must be 32 bytes');
    }

    // Create new account for the document
    const documentAccount = Keypair.generate();

    // Calculate rent exemption
    const accountSize = this.calculateDocumentAccountSize(signerPubkeys.length);
    const lamports = await this.connection.getMinimumBalanceForRentExemption(accountSize);

    // Build instruction data
    // Format: [instruction_type: u8, document_hash: [u8; 32], signers_count: u32, ...signers: [Pubkey]]
    const instructionData = Buffer.concat([
      Buffer.from([InstructionType.CreateDocument]),
      hashBytes,
      Buffer.from(new Uint32Array([signerPubkeys.length]).buffer),
      ...signerPubkeys.map(pk => pk.toBuffer()),
    ]);

    // Create transaction
    const transaction = new Transaction();

    // Add create account instruction - fee payer funds the account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.feePayerKeypair.publicKey,
        newAccountPubkey: documentAccount.publicKey,
        lamports,
        space: accountSize,
        programId: this.programId,
      })
    );

    // Add create document instruction - creator is recorded on-chain
    transaction.add(
      new TransactionInstruction({
        keys: [
          { pubkey: documentAccount.publicKey, isSigner: false, isWritable: true },
          { pubkey: creatorKeypair.publicKey, isSigner: true, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      })
    );

    // Send transaction - fee payer signs first (pays fees), creator signs (authority), document account signs (new account)
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.feePayerKeypair, creatorKeypair, documentAccount],
      { commitment: 'confirmed' }
    );

    return {
      documentAccount: documentAccount.publicKey,
      signature,
    };
  }

  /**
   * Sign a document on-chain
   * @param documentAccountPubkey Public key of the document account
   * @param signerDID DID of the signer
   * @param signatureData 64-byte signature data
   * @returns Transaction signature
   */
  async signDocument(
    documentAccountPubkey: PublicKey,
    signerDID: string,
    signatureData: Uint8Array
  ): Promise<string> {
    if (signatureData.length !== 64) {
      throw new Error('Signature must be 64 bytes');
    }

    // Get signer keypair
    const signerKeypair = await this.keypairManager.getKeypairByDID(signerDID);
    if (!signerKeypair) {
      throw new Error(`No keypair found for signer DID: ${signerDID}`);
    }

    // Build instruction data
    // Format: [instruction_type: u8, signature: [u8; 64]]
    const instructionData = Buffer.concat([
      Buffer.from([InstructionType.SignDocument]),
      Buffer.from(signatureData),
    ]);

    // Create transaction
    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [
          { pubkey: documentAccountPubkey, isSigner: false, isWritable: true },
          { pubkey: signerKeypair.publicKey, isSigner: true, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      })
    );

    // Send transaction - fee payer pays transaction fees, signer authorizes the signature
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.feePayerKeypair, signerKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Update document status (creator only)
   * @param documentAccountPubkey Public key of the document account
   * @param creatorDID DID of the creator
   * @param newStatus New status to set
   * @returns Transaction signature
   */
  async updateStatus(
    documentAccountPubkey: PublicKey,
    creatorDID: string,
    newStatus: DocumentStatus
  ): Promise<string> {
    // Get creator keypair
    const creatorKeypair = await this.keypairManager.getKeypairByDID(creatorDID);
    if (!creatorKeypair) {
      throw new Error(`No keypair found for creator DID: ${creatorDID}`);
    }

    // Build instruction data
    // Format: [instruction_type: u8, status: u8]
    const instructionData = Buffer.from([
      InstructionType.UpdateStatus,
      newStatus,
    ]);

    // Create transaction
    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [
          { pubkey: documentAccountPubkey, isSigner: false, isWritable: true },
          { pubkey: creatorKeypair.publicKey, isSigner: true, isWritable: false },
        ],
        programId: this.programId,
        data: instructionData,
      })
    );

    // Send transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [creatorKeypair],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Fetch and deserialize a document account from the blockchain
   * @param documentAccountPubkey Public key of the document account
   * @returns Deserialized document account data
   */
  async getDocumentAccount(documentAccountPubkey: PublicKey): Promise<DocumentAccount | null> {
    const accountInfo = await this.connection.getAccountInfo(documentAccountPubkey);
    if (!accountInfo) {
      return null;
    }

    // Deserialize the account data
    // Note: This is a simplified deserialization. In production, use borsh schema
    const data = accountInfo.data;
    let offset = 0;

    // document_hash: [u8; 32]
    const documentHash = data.slice(offset, offset + 32);
    offset += 32;

    // status: u8
    const status = data[offset] as DocumentStatus;
    offset += 1;

    // signers: Vec<Pubkey>
    const signersCount = data.readUInt32LE(offset);
    offset += 4;
    const signers: PublicKey[] = [];
    for (let i = 0; i < signersCount; i++) {
      signers.push(new PublicKey(data.slice(offset, offset + 32)));
      offset += 32;
    }

    // signatures: Vec<Signature>
    const signaturesCount = data.readUInt32LE(offset);
    offset += 4;
    const signatures: Signature[] = [];
    for (let i = 0; i < signaturesCount; i++) {
      const signer = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;
      const signature = data.slice(offset, offset + 64);
      offset += 64;
      const timestamp = data.readBigInt64LE(offset);
      offset += 8;
      signatures.push({ signer, signature, timestamp });
    }

    // created_at: i64
    const createdAt = data.readBigInt64LE(offset);
    offset += 8;

    // updated_at: i64
    const updatedAt = data.readBigInt64LE(offset);
    offset += 8;

    // creator: Pubkey
    const creator = new PublicKey(data.slice(offset, offset + 32));

    return {
      documentHash,
      status,
      signers,
      signatures,
      createdAt,
      updatedAt,
      creator,
    };
  }

  /**
   * Verify a document exists and matches the expected hash
   * @param documentAccountPubkey Public key of the document account
   * @param expectedHash Expected document hash (hex string)
   * @returns True if document exists and hash matches
   */
  async verifyDocumentHash(
    documentAccountPubkey: PublicKey,
    expectedHash: string
  ): Promise<boolean> {
    const account = await this.getDocumentAccount(documentAccountPubkey);
    if (!account) {
      return false;
    }

    const actualHash = Buffer.from(account.documentHash).toString('hex');
    return actualHash === expectedHash;
  }

  /**
   * Check if all signers have signed the document
   * @param documentAccountPubkey Public key of the document account
   * @returns True if all signers have signed
   */
  async isDocumentFullySigned(documentAccountPubkey: PublicKey): Promise<boolean> {
    const account = await this.getDocumentAccount(documentAccountPubkey);
    if (!account) {
      return false;
    }

    return account.signatures.length === account.signers.length &&
           account.status === DocumentStatus.Completed;
  }

  /**
   * Get the RPC connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }
}

/**
 * Create and configure the Solana document client
 */
export function createSolanaClient(): SolanaDocumentClient {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const programId = process.env.SOLANA_PROGRAM_ID;

  if (!programId) {
    throw new Error('SOLANA_PROGRAM_ID not configured');
  }

  return new SolanaDocumentClient(rpcUrl, programId);
}
