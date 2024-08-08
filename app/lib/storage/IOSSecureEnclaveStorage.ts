import { SecureStorage } from './SecureStorage';
import { BrowserSecureStorage } from './browserSecureStorage';

export class IOSSecureEnclaveStorage implements SecureStorage {
  private browserStorage = new BrowserSecureStorage();

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    console.warn('Using browser storage instead of iOS Secure Enclave');
    return this.browserStorage.storeDID(did, publicKey, encryptedPrivateKey);
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    console.warn('Using browser storage instead of iOS Secure Enclave');
    return this.browserStorage.retrieveDID(did);
  }

  async deleteData(did: string): Promise<void> {
    console.warn('Using browser storage instead of iOS Secure Enclave');
    return this.browserStorage.deleteData(did);
  }
}