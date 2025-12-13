import { Keypair } from '@solana/web3.js';
export declare class SecureEnclaveService {
    private enclave;
    storeKeyPair(did: string, keyPair: Keypair): Promise<void>;
    retrieveKeyPair(did: string): Promise<Keypair | null>;
    signChallenge(did: string, challenge: string): Promise<Uint8Array | null>;
    private encryptKey;
    private decryptKey;
}
