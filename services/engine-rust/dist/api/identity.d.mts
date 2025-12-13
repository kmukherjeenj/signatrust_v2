export declare const createIdentity: () => Promise<{
    did: string;
    publicKey: string;
    proof: any;
    publicSignals: any;
    message: string;
}>;
export declare const getIdentity: (did: string) => Promise<any>;
export declare const listIdentities: () => Promise<string[]>;
export declare const deleteIdentity: (did: string) => Promise<boolean>;
export declare const updateIdentity: (did: string, updateData: any) => Promise<any>;
export declare const login: (did: string, proof: any, publicSignals: any) => Promise<any>;
