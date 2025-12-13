import { Keypair } from '@solana/web3.js';
export declare class SolanaDIDProvider {
    private connection;
    private programId;
    constructor(options: {
        rpcUrl: string;
        programId: string;
    });
    createIdentifier(payerKeypair: Keypair): Promise<{
        did: string;
        publicKey: string;
    }>;
    getDIDDocument(did: string): Promise<any | null>;
    updateIdentifier(did: string, payerKeypair: Keypair, updateData: any): Promise<string>;
    deactivateIdentifier(did: string, payerKeypair: Keypair): Promise<string>;
    getDIDAccount(did: string): Promise<{
        controller: string;
        publicKey: string;
    } | null>;
}
