import { Keypair } from "@solana/web3.js";
export declare class SolanaDIDService {
    private connection;
    private programId;
    constructor(rpcUrl: string, programId: string);
    private getKeypairFromDID;
    signDocument(did: string, documentId: string, signature: string): Promise<string>;
    createDID(payerKeypair: Keypair): Promise<{
        did: string;
        publicKey: string;
    }>;
    resolveDID(did: string): Promise<any>;
    updateDID(did: string, payerKeypair: Keypair, updateData: Buffer): Promise<string>;
    deactivateDID(did: string, payerKeypair: Keypair): Promise<string>;
    getProvider(): void;
    storeDocumentHash(did: string, documentHash: string): Promise<string>;
    verifyDocumentHash(documentHash: string): Promise<boolean>;
}
