import { Keypair, PublicKey } from '@solana/web3.js';
export declare class SignatureService {
    private connection;
    constructor(rpcUrl: string);
    signDocument(signerKeypair: Keypair, document: any): Promise<string>;
    verifySignature(signature: string, document: any, signerPublicKey: PublicKey): Promise<boolean>;
}
