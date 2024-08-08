import { SecureStorage } from './SecureStorage';
import * as CryptoJS from 'crypto-js';

export class WebSecureStorage implements SecureStorage {
  private readonly storagePrefix = 'SignatrustSecure_';

  private async encrypt(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private async getEncryptionKey(): Promise<string> {
    // In a real-world scenario, this key should be securely stored and retrieved
    // For now, we'll use a placeholder
    return 'your-secure-encryption-key';
  }

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    const data = JSON.stringify({ publicKey, encryptedPrivateKey });
    const encryptedData = await this.encrypt(data);
    localStorage.setItem(`${this.storagePrefix}${did}`, encryptedData);
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    const encryptedData = localStorage.getItem(`${this.storagePrefix}${did}`);
    if (!encryptedData) return null;
    const decryptedData = await this.decrypt(encryptedData);
    return JSON.parse(decryptedData);
  }

  async deleteData(did: string): Promise<void> {
    localStorage.removeItem(`${this.storagePrefix}${did}`);
  }
}