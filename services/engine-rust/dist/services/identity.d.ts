export declare class IdentityService {
    private connection;
    private programId;
    private payerPublicKey;
    private payerKeypair;
    private rpcUrl;
    private zkProofService;
    constructor();
    createIdentity(): Promise<{
        did: string;
        publicKey: string;
        proof: any;
        publicSignals: any;
        challenge: string;
    }>;
    getIdentity(did: string): Promise<any>;
    listIdentities(): Promise<string[]>;
    deleteIdentity(did: string): Promise<boolean>;
    updateIdentity(did: string, updateData: any): Promise<any>;
    checkBalance(): Promise<number>;
    sendTransaction(): Promise<void>;
    verifyIdentity(did: string, proof: any, publicSignals: any, challenge: string): Promise<boolean>;
    login(did: string, proof: any, publicSignals: any): Promise<any>;
}
