// utils/didUtils.ts
import nacl from "tweetnacl";
import crypto from "crypto";
import bs58 from "bs58";

/**
 * Derives a Solana DID from a ZK proof's public signals.
 * Converts the first public signal (pubkey bigint) into a Base58-encoded Solana DID.
 */
export function deriveDidFromPublicSignals(publicSignals: string[]): string {
  const publicKeyBigInt = BigInt(publicSignals[0]);
  const hex = publicKeyBigInt.toString(16).padStart(64, "0"); // Ensure 32 bytes

  const publicKeyBytes = hexToUint8Array(hex); // ✅ Use Uint8Array not Buffer
  const base58PublicKey = bs58.encode(publicKeyBytes);

  return `did:sol:${base58PublicKey}`;
}

function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const uint8 = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    uint8[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return uint8;
}

/**
 * Generates a random 32-byte hex challenge string.
 */
export function generateChallenge(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Simulated in-memory key store for development/testing.
 * Replace with a secure key storage mechanism in production (e.g. wallet integration or hardware secure enclave).
 */
const didKeyMap: Record<string, Uint8Array> = {
  "did:sol:abc123": new Uint8Array(64), // ❗ Replace with real key
};

/**
 * Retrieves the secret key associated with a DID.
 * Throws an error if the key is not found.
 */
export async function getSecretKeyForDID(did: string): Promise<Uint8Array> {
  const key = didKeyMap[did];
  if (!key) {
    throw new Error(`Secret key not found for DID: ${did}`);
  }
  return key;
}

/**
 * Signs a challenge string using the secret key tied to a DID.
 * Returns a Uint8Array signature.
 */
export async function signChallenge(
  did: string,
  challenge: string
): Promise<Uint8Array> {
  const secretKey = await getSecretKeyForDID(did);
  const message = new TextEncoder().encode(challenge);
  return nacl.sign.detached(message, secretKey);
}
