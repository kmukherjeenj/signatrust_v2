-- Migration: Add Keypair model for secure Solana keypair storage
-- Created: 2025-12-11
-- Run this when database is available

CREATE TABLE "Keypair" (
  "did" TEXT NOT NULL PRIMARY KEY,
  "encryptedSecretKey" TEXT NOT NULL,
  "iv" TEXT NOT NULL,
  "authTag" TEXT NOT NULL,
  "publicKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3)
);

CREATE INDEX "Keypair_publicKey_idx" ON "Keypair"("publicKey");

COMMENT ON TABLE "Keypair" IS 'Encrypted Solana keypairs for DID management';
COMMENT ON COLUMN "Keypair"."did" IS 'Decentralized Identifier (did:sol:pubkey)';
COMMENT ON COLUMN "Keypair"."encryptedSecretKey" IS 'AES-256-GCM encrypted 64-byte Solana secret key (hex encoded)';
COMMENT ON COLUMN "Keypair"."iv" IS 'Initialization Vector for AES-GCM (16 bytes, hex encoded)';
COMMENT ON COLUMN "Keypair"."authTag" IS 'GCM Authentication Tag for integrity verification';
COMMENT ON COLUMN "Keypair"."publicKey" IS 'Base58 encoded Solana public key (for verification)';
