
import { SecureStorage } from './SecureStorage';
import { BrowserSecureStorage } from './browserSecureStorage';

export class AndroidKeystoreStorage implements SecureStorage {
  private browserStorage = new BrowserSecureStorage();

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    console.warn('Using browser storage instead of Android Keystore');
    return this.browserStorage.storeDID(did, publicKey, encryptedPrivateKey);
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    console.warn('Using browser storage instead of Android Keystore');
    return this.browserStorage.retrieveDID(did);
  }

  async deleteData(did: string): Promise<void> {
    console.warn('Using browser storage instead of Android Keystore');
    return this.browserStorage.deleteData(did);
  }
}