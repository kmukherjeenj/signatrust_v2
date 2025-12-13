export declare class ZKProofService {
    private circuitWasmPath;
    private zkeyPath;
    private vKeyPath;
    constructor();
    private validatePaths;
    generateProof(did: string, challenge: string): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    verifyProof(proof: any, publicSignals: any): Promise<boolean>;
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
    generateAuthProof(pubKey: string, signature: string, message: string): Promise<{
        proof: any;
        publicSignals: any;
    }>;
    verifyAuthProof(proof: any, publicSignals: any, challenge: string): Promise<boolean>;
}
