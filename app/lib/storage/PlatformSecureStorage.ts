import { SecureStorage } from './SecureStorage';
import { WebSecureStorage } from './WebSecureStorage';
import { IOSSecureEnclaveStorage } from './IOSSecureEnclaveStorage';
import { AndroidKeystoreStorage } from './AndroidKeystoreStorage';

export class PlatformSecureStorage implements SecureStorage {
  private storage: SecureStorage;

  constructor() {
    if (typeof window !== 'undefined') {
      // Browser environment
      this.storage = new WebSecureStorage();
    } else if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Server-side rendering
      this.storage = new WebSecureStorage(); // Fallback to web storage on server
    } else {
      // Assume native mobile environment
      // In a real-world scenario, you'd need to detect iOS vs Android
      // This is a simplified example
      this.storage = process.env.IS_IOS ? new IOSSecureEnclaveStorage() : new AndroidKeystoreStorage();
    }
  }

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    return this.storage.storeDID(did, publicKey, encryptedPrivateKey);
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    return this.storage.retrieveDID(did);
  }

  async deleteData(did: string): Promise<void> {
    return this.storage.deleteData(did);
  }
}