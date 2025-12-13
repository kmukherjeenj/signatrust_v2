import { Keypair } from '@solana/web3.js';
declare const config: {
    solana: {
        network: string;
        rpcUrl: string;
        programId: string;
        payerPrivateKey: any;
        cluster: string;
        keypairPath: string;
        feePayer: string;
        payerKeypair: Keypair | null;
    };
    zkProof: {
        circuitWasmPath: string;
        circuitPath: string;
        zkeyPath: string;
        verificationKey: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
};
export { config };
