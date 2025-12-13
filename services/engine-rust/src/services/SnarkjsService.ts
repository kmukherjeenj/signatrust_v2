import * as snarkjs from 'snarkjs';

export class SnarkjsService {
  async generateProof(circuitName: string, input: any): Promise<any> {
    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        `${circuitName}.wasm`,
        `${circuitName}.zkey`
      );
      return { proof, publicSignals };
    } catch (error) {
      console.error('Error generating proof:', error);
      throw new Error('Failed to generate proof');
    }
  }

  async verifyProof(circuitName: string, proof: any, publicSignals: any): Promise<boolean> {
    try {
      const vKey = await snarkjs.zKey.exportVerificationKey(`${circuitName}.zkey`);
      return snarkjs.groth16.verify(vKey, publicSignals, proof);
    } catch (error) {
      console.error('Error verifying proof:', error);
      throw new Error('Failed to verify proof');
    }
  }
}