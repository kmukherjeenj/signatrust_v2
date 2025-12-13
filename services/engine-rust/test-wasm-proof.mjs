import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as snarkjs from 'snarkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProofGenerator {
  constructor(circuitWasmPath, zkeyPath, vKeyPath) {
    this.circuitWasmPath = circuitWasmPath;
    this.zkeyPath = zkeyPath;
    this.vKeyPath = vKeyPath;
  }

  stringToBigInt(str) {
    return BigInt('0x' + Buffer.from(str).toString('hex')).toString();
  }

  async generateProof(pubKey, signature, message) {
    try {
      const input = {
        pubKey: this.stringToBigInt(pubKey),
        signature: this.stringToBigInt(signature),
        message: this.stringToBigInt(message)
      };

      console.log('Generating proof with inputs:', input);
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        this.circuitWasmPath,
        this.zkeyPath
      );
      console.log('ZK proof generated successfully');
      return { proof, publicSignals };
    } catch (error) {
      console.error('Error generating ZK proof:', error);
      throw new Error('Failed to generate ZK proof');
    }
  }

  async verifyProof(proof, publicSignals) {
    try {
      const vKey = JSON.parse(fs.readFileSync(this.vKeyPath, 'utf-8'));
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      console.log(`ZK proof verification result: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Error verifying ZK proof:', error);
      throw new Error('Failed to verify ZK proof');
    }
  }
}

async function testWasmAccess(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`Successfully read file. Size: ${fileBuffer.length} bytes`);
  } catch (error) {
    console.error(`Error accessing file at ${filePath}:`, error);
  }
}

async function runTest() {
  const circuitWasmPath = path.join(__dirname, 'circuits', 'auth.wasm');
  const zkeyPath = path.join(__dirname, 'circuits', 'auth.zkey');
  const vKeyPath = path.join(__dirname, 'circuits', 'verification_key.json');

  console.log('Testing WASM file access...');
  console.log('WASM path:', circuitWasmPath);
  await testWasmAccess(circuitWasmPath);

  console.log('\nTesting zkey file access...');
  console.log('zkey path:', zkeyPath);
  await testWasmAccess(zkeyPath);

  console.log('\nTesting verification key file access...');
  console.log('vKey path:', vKeyPath);
  await testWasmAccess(vKeyPath);

  console.log('\nTesting proof generation and verification...');
  const proofGenerator = new ProofGenerator(circuitWasmPath, zkeyPath, vKeyPath);

  // Example values - replace these with actual test values
  const testPubKey = '0x1234567890123456789012345678901234567890';
  const testSignature = '0x9876543210987654321098765432109876543210';
  const testMessage = 'Hello, world!';

  try {
    const { proof, publicSignals } = await proofGenerator.generateProof(testPubKey, testSignature, testMessage);
    console.log('Proof generated successfully:', { proof, publicSignals });

    const isValid = await proofGenerator.verifyProof(proof, publicSignals);
    console.log('Proof verification result:', isValid);
  } catch (error) {
    console.error('Error in proof generation or verification test:', error);
  }
}

runTest().catch(console.error);