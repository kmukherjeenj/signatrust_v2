export interface SecureStorage {
  storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void>;
  retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null>;
  deleteData(did: string): Promise<void>;
}