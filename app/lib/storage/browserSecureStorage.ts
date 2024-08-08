import { SecureStorage } from './SecureStorage';
import { SecureStorageError } from './errors';

export class BrowserSecureStorage implements SecureStorage {
  private async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    const result = new Uint8Array(iv.length + encrypted.byteLength + exportedKey.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    result.set(new Uint8Array(exportedKey), iv.length + encrypted.byteLength);

    return btoa(String.fromCharCode.apply(null, Array.from(result)));
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const decoder = new TextDecoder();
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const iv = data.slice(0, 12);
    const encrypted = data.slice(12, -32);
    const keyData = data.slice(-32);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return decoder.decode(decrypted);
  }

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    try {
      const data = JSON.stringify({ publicKey, encryptedPrivateKey });
      const encryptedData = await this.encrypt(data);
      localStorage.setItem(did, encryptedData);
    } catch (error) {
      throw new SecureStorageError(`Failed to store DID: ${did}`, error as Error);
    }
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    try {
      const encryptedData = localStorage.getItem(did);
      if (!encryptedData) return null;
      const decryptedData = await this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      throw new SecureStorageError(`Failed to retrieve DID: ${did}`, error as Error);
    }
  }

  async deleteData(did: string): Promise<void> {
    try {
      localStorage.removeItem(did);
    } catch (error) {
      throw new SecureStorageError(`Failed to delete DID: ${did}`, error as Error);
    }
  }
}