/**
 * To achieve a secure, court-admissible, and hacker-resistant e-signature system for Signatrust,
 * while maintaining ease of use, the best approach would be to use both the DID and a challenge in your ZKProof system. Here's why:
 * 
 * 1. DID (Decentralized Identifier):
 *    - Provides a persistent, cryptographically verifiable identifier for the user.
 *    - Allows for long-term identity management and verification.
 * 
 * 2. Challenge:
 *    - Introduces a dynamic element to each proof generation, preventing replay attacks.
 *    - Ensures that the proof is fresh and was generated for this specific authentication attempt.
 * 
 * 3. Public Key:
 *    - While important, the public key is typically derived from or associated with the DID, so it's not necessary to include it explicitly in the proof generation.
 * 
 * The combination of DID and challenge ensures that each proof is unique and tied to a specific user and authentication attempt, enhancing security and compliance.
 */

import * as snarkjs from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';
import dotenv from 'dotenv';
import { SnarkjsService } from './SnarkjsService.ts';
import * as crypto from 'crypto';

dotenv.config();

function stringToHex(str: string): string {
  return Array.from(str).map((char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ZKProofService {
  private circuitWasmPath: string;
  private zkeyPath: string;
  private vKeyPath: string;
  private snarkjsService: SnarkjsService;

  constructor() {
    //const rootDir = path.resolve(__dirname, '..', '..');
    // Use process.cwd() for Vercel environment
    const rootDir = process.env.VERCEL ? process.cwd() : path.resolve(__dirname, '..', '..');
    this.circuitWasmPath = path.join(rootDir, process.env.ZK_PROOF_CIRCUIT_WASM_PATH || '');
    this.zkeyPath = path.join(rootDir, process.env.ZK_PROOF_CIRCUIT_PATH || '');
    this.vKeyPath = path.join(rootDir, process.env.ZK_PROOF_VERIFICATION_KEY || '');
    this.snarkjsService = new SnarkjsService();
    //this.circuitWasmPath = path.join(rootDir, config.zkProof.circuitWasmPath);
    //this.zkeyPath = path.join(rootDir, config.zkProof.circuitPath);
    //this.vKeyPath = path.join(rootDir, config.zkProof.verificationKey);

    this.validatePaths();
  }

  private validatePaths(): void {
    if (!fs.existsSync(this.circuitWasmPath)) {
      logger.error(`Circuit WASM file not found at ${this.circuitWasmPath}`);
      throw new Error('Circuit WASM file not found');
    }
    if (!fs.existsSync(this.zkeyPath)) {
      logger.error(`Circuit zkey file not found at ${this.zkeyPath}`);
      throw new Error('Circuit zkey file not found');
    }
    if (!fs.existsSync(this.vKeyPath)) {
      logger.error(`Verification key file not found at ${this.vKeyPath}`);
      throw new Error('Verification key file not found');
    }
  }

  async generateProof(did: string, challenge: string): Promise<{ proof: any; publicSignals: any }> {
    try {
      /*const input = {
          did: did,
          publicKey: publicKey
        };*/
      const input = {
        pubKey: BigInt('0x' + Buffer.from(did).toString('hex')).toString(),
        signature: BigInt('0x' + Buffer.from(challenge).toString('hex')).toString(),
        message: BigInt('0x' + Buffer.from(challenge).toString('hex')).toString()
      };

      logger.info('Generating proof with inputs:', input);
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          input,
          this.circuitWasmPath,
          this.zkeyPath
        );
      logger.info('ZK proof generated successfully');
      return { proof, publicSignals };
    } catch (error) {
      logger.error('Error generating ZK proof:', error);
      throw new Error('Failed to generate ZK proof');
      }
    }

  async generateLUVProof(did: string, documentHash: string): Promise<any> {
      const input = {
        did: this.hashToBigInt(did),
        documentHash: this.hashToBigInt(documentHash)
      };
  
      const { proof, publicSignals } = await this.snarkjsService.generateProof('luv_circuit', input);
  
      return {
        proof,
        publicSignals
      };
  }

  async verifyLUVProof(zkProof: any, did: string, documentHash: string): Promise<boolean> {
    const publicSignals = [
      this.hashToBigInt(did),
      this.hashToBigInt(documentHash)
    ];

    return this.snarkjsService.verifyProof('luv_circuit', zkProof, publicSignals);
  }

  private hashToBigInt(input: string): bigint {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return BigInt(`0x${hash}`);
  }

  async verifyProof(proof: any, publicSignals: any): Promise<boolean> {
    try {
      logger.info('Verifying proof:', JSON.stringify(proof));
      logger.info('Verifying publicSignals:', JSON.stringify(publicSignals));
      
      const vKey = JSON.parse(fs.readFileSync(this.vKeyPath, 'utf-8'));
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      logger.info(`ZK proof verification result: ${isValid}`);
      return isValid;
    } catch (error) {
      logger.error('Error verifying ZK proof:', error);
      throw new Error('Failed to verify ZK proof');
    }
  }

async generateAuthProof(pubKey: string, signature: string, message: string): Promise<{ proof: any; publicSignals: any }> {
  try {
    // Convert inputs to numeric representations
    const pubKeyNumeric = BigInt('0x' + Buffer.from(pubKey).toString('hex')).toString();
    const signatureNumeric = BigInt('0x' + Buffer.from(signature).toString('hex')).toString();
    const messageNumeric = BigInt('0x' + Buffer.from(message).toString('hex')).toString();

    logger.info('Generating auth proof with inputs:', {
      pubKey: pubKeyNumeric,
      signature: signatureNumeric,
      message: messageNumeric
    });

    const input = {
      pubKey: pubKeyNumeric,
      signature: signatureNumeric,
      message: messageNumeric
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      this.circuitWasmPath,
      this.zkeyPath
    );
    logger.info('ZK auth proof generated successfully');
    return { proof, publicSignals };
  } catch (error) {
    logger.error('Error generating ZK auth proof:', error);
    throw new Error('Failed to generate ZK auth proof');
  }
}

async verifyAuthProof(proof: any, publicSignals: any, challenge: string): Promise<boolean> {
  try {
    const challengeHash = crypto.createHash('sha256').update(challenge).digest('hex');
    const providedChallengeHash = publicSignals[2]; // Assuming the challenge hash is the third element
    if (challengeHash !== providedChallengeHash) {
      logger.error('Challenge mismatch');
      return false;
    }
    return await this.verifyProof(proof, publicSignals);
  } catch (error) {
    logger.error('Error verifying auth proof:', error);
    throw new Error('Failed to verify auth proof');
  }
}
}