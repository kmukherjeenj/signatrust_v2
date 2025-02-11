// src/utils/didUtils.ts
import bs58 from 'bs58';
import crypto from 'crypto';
import * as snarkjs from 'snarkjs';

export function deriveDidFromPublicSignals(publicSignals: string[]): string {
  const publicKeyBigInt = BigInt(publicSignals[0]);
  const publicKeyBuffer = Buffer.from(publicKeyBigInt.toString(16).padStart(64, '0'), 'hex');
  const base58PublicKey = bs58.encode(publicKeyBuffer);
  return `did:sol:${base58PublicKey}`;
}

export function generateChallenge(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function generateProof(did: string, challenge: string): Promise<{ proof: any; publicSignals: any }> {
  try {
    const input = {
      pubKey: BigInt('0x' + Buffer.from(did).toString('hex')).toString(),
      signature: BigInt('0x' + Buffer.from(challenge).toString('hex')).toString(),
      message: BigInt('0x' + Buffer.from(challenge).toString('hex')).toString()
    };

    // Replace these paths with the actual paths to your circuit files
    const wasmPath = 'http://localhost:3000/circuit.wasm';
    const zkeyPath = 'http://localhost:3000/circuit.zkey';

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    return { proof, publicSignals };
  } catch (error) {
    console.error('Error generating proof:', error);
    throw new Error('Failed to generate proof');
  }
}