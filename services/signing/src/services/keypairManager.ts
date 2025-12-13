import { Keypair, PublicKey } from '@solana/web3.js';
import { prisma } from '../adapters/prisma.js';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { getSecret } from './secretsManager.js';

/**
 * Keypair storage in database
 * Encrypted with AES-256-GCM
 */
interface StoredKeypair {
  did: string;
  encryptedSecretKey: string; // Hex-encoded encrypted secret key
  iv: string;                 // Initialization vector
  authTag: string;            // GCM authentication tag
  publicKey: string;          // Base58 public key (for verification)
  createdAt: Date;
  lastUsedAt?: Date;
}

/**
 * Secure keypair management for Solana
 * - Stores keypairs encrypted in database
 * - Derives encryption key from master secret
 * - Supports key rotation
 */
export class KeypairManager {
  private masterKey: Buffer | null = null;

  /**
   * Initialize and load master encryption key
   */
  private async getMasterKey(): Promise<Buffer> {
    if (this.masterKey) {
      return this.masterKey;
    }

    // Get master key from secrets manager
    const masterKeyHex = await getSecret('KEYPAIR_MASTER_KEY');
    if (!masterKeyHex) {
      throw new Error('KEYPAIR_MASTER_KEY not configured');
    }

    this.masterKey = Buffer.from(masterKeyHex, 'hex');

    if (this.masterKey.length !== 32) {
      throw new Error('KEYPAIR_MASTER_KEY must be 32 bytes (64 hex characters)');
    }

    return this.masterKey;
  }

  /**
   * Encrypt a secret key using AES-256-GCM
   */
  private async encryptSecretKey(secretKey: Uint8Array): Promise<{
    encrypted: string;
    iv: string;
    authTag: string;
  }> {
    const masterKey = await this.getMasterKey();
    const iv = randomBytes(16); // GCM recommended IV size

    const cipher = createCipheriv('aes-256-gcm', masterKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(secretKey)),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt a secret key using AES-256-GCM
   */
  private async decryptSecretKey(
    encryptedHex: string,
    ivHex: string,
    authTagHex: string
  ): Promise<Uint8Array> {
    const masterKey = await this.getMasterKey();
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return new Uint8Array(decrypted);
  }

  /**
   * Create a new keypair for a DID
   * @param did Decentralized Identifier
   * @returns Solana keypair
   */
  async createKeypairForDID(did: string): Promise<Keypair> {
    // Check if keypair already exists
    const existing = await this.getKeypairByDID(did);
    if (existing) {
      throw new Error(`Keypair already exists for DID: ${did}`);
    }

    // Generate new Solana keypair
    const keypair = Keypair.generate();

    // Encrypt the secret key
    const { encrypted, iv, authTag } = await this.encryptSecretKey(keypair.secretKey);

    // Store in database (using Prisma raw query since we don't have a Keypair model yet)
    // TODO: Add Keypair model to Prisma schema
    await prisma.$executeRaw`
      INSERT INTO "Keypair" (did, "encryptedSecretKey", iv, "authTag", "publicKey", "createdAt")
      VALUES (
        ${did},
        ${encrypted},
        ${iv},
        ${authTag},
        ${keypair.publicKey.toBase58()},
        NOW()
      )
      ON CONFLICT (did) DO NOTHING
    `;

    return keypair;
  }

  /**
   * Get keypair by DID
   * @param did Decentralized Identifier
   * @returns Solana keypair or null if not found
   */
  async getKeypairByDID(did: string): Promise<Keypair | null> {
    // Query from database
    const result: any[] = await prisma.$queryRaw`
      SELECT * FROM "Keypair" WHERE did = ${did} LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const stored = result[0];

    // Decrypt the secret key
    const secretKey = await this.decryptSecretKey(
      stored.encryptedSecretKey,
      stored.iv,
      stored.authTag
    );

    // Reconstruct keypair
    const keypair = Keypair.fromSecretKey(secretKey);

    // Verify public key matches
    if (keypair.publicKey.toBase58() !== stored.publicKey) {
      throw new Error(`Keypair verification failed for DID: ${did}`);
    }

    // Update last used timestamp
    await prisma.$executeRaw`
      UPDATE "Keypair" SET "lastUsedAt" = NOW() WHERE did = ${did}
    `;

    return keypair;
  }

  /**
   * Get or create keypair for DID
   * @param did Decentralized Identifier
   * @returns Solana keypair
   */
  async getOrCreateKeypairForDID(did: string): Promise<Keypair> {
    const existing = await this.getKeypairByDID(did);
    if (existing) {
      return existing;
    }

    return this.createKeypairForDID(did);
  }

  /**
   * Delete keypair for DID
   * @param did Decentralized Identifier
   */
  async deleteKeypairForDID(did: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM "Keypair" WHERE did = ${did}
    `;
  }

  /**
   * Rotate master key (re-encrypt all keypairs)
   * @param newMasterKey New 32-byte master key
   */
  async rotateMasterKey(newMasterKey: Buffer): Promise<void> {
    if (newMasterKey.length !== 32) {
      throw new Error('Master key must be 32 bytes');
    }

    // Get all keypairs
    const allKeypairs: any[] = await prisma.$queryRaw`
      SELECT * FROM "Keypair"
    `;

    const oldMasterKey = await this.getMasterKey();

    for (const stored of allKeypairs) {
      // Decrypt with old key
      const secretKey = await this.decryptSecretKey(
        stored.encryptedSecretKey,
        stored.iv,
        stored.authTag
      );

      // Re-encrypt with new key
      const originalMasterKey = this.masterKey;
      this.masterKey = newMasterKey;

      const { encrypted, iv, authTag } = await this.encryptSecretKey(secretKey);

      this.masterKey = originalMasterKey; // Restore for next iteration

      // Update in database
      await prisma.$executeRaw`
        UPDATE "Keypair"
        SET
          "encryptedSecretKey" = ${encrypted},
          iv = ${iv},
          "authTag" = ${authTag}
        WHERE did = ${stored.did}
      `;
    }

    // Update master key
    this.masterKey = newMasterKey;
  }

  /**
   * Generate a DID from a public key
   * @param publicKey Solana public key
   * @returns DID string
   */
  static generateDID(publicKey: PublicKey): string {
    return `did:sol:${publicKey.toBase58()}`;
  }

  /**
   * Extract public key from DID
   * @param did Decentralized Identifier
   * @returns Solana public key
   */
  static publicKeyFromDID(did: string): PublicKey {
    const parts = did.split(':');
    if (parts.length !== 3 || parts[0] !== 'did' || parts[1] !== 'sol') {
      throw new Error(`Invalid DID format: ${did}`);
    }

    return new PublicKey(parts[2]);
  }
}

/**
 * Global keypair manager instance
 */
let keypairManagerInstance: KeypairManager | null = null;

/**
 * Get or create the global keypair manager instance
 */
export function getKeypairManager(): KeypairManager {
  if (!keypairManagerInstance) {
    keypairManagerInstance = new KeypairManager();
  }
  return keypairManagerInstance;
}
