declare module 'snarkjs' {
    export namespace groth16 {
      function fullProve(input: any, wasmFile: string, zkeyFile: string): Promise<{
        proof: any;
        publicSignals: any;
      }>;
  
      function verify(vkeyJson: any, publicSignals: any, proof: any): Promise<boolean>;
    }
  }