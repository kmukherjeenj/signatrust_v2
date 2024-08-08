import { SecureStorage } from './SecureStorage';
import { SecureStorageError } from './errors';
import * as crypto from 'crypto';

export class MacOSSecureStorage implements SecureStorage {
  private serviceName = 'SignatrustDID';
  private isRunningInBrowser: boolean;
  private keychain: any;

  constructor() {
    this.isRunningInBrowser = typeof window !== 'undefined';
    if (!this.isRunningInBrowser) {
      try {
        this.keychain = require('keychain');
      } catch (error) {
        console.warn('Keychain module is not available. Falling back to browser-compatible encryption.');
      }
    }
  }

  private async encrypt(data: string): Promise<string> {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${key.toString('hex')}:${encrypted}`;
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const [ivHex, keyHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    try {
      const data = JSON.stringify({ publicKey, encryptedPrivateKey });
      if (!this.isRunningInBrowser && this.keychain) {
        await new Promise((resolve, reject) => {
          this.keychain.setPassword({
            account: did,
            service: this.serviceName,
            password: data
          }, (err: Error | null) => {
            if (err) reject(err);
            else resolve(null);
          });
        });
      } else {
        const encryptedData = await this.encrypt(data);
        localStorage.setItem(`${this.serviceName}_${did}`, encryptedData);
      }
    } catch (error) {
      throw new SecureStorageError(`Failed to store DID: ${did}`, error as Error);
    }
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    try {
      let data: string | null = null;
      if (!this.isRunningInBrowser && this.keychain) {
        data = await new Promise((resolve, reject) => {
          this.keychain.getPassword({
            account: did,
            service: this.serviceName
          }, (err: Error | null, password: string) => {
            if (err) reject(err);
            else resolve(password);
          });
        });
      } else {
        const encryptedData = localStorage.getItem(`${this.serviceName}_${did}`);
        if (encryptedData) {
          data = await this.decrypt(encryptedData);
        }
      }
      return data ? JSON.parse(data) : null;
    } catch (error) {
      throw new SecureStorageError(`Failed to retrieve DID: ${did}`, error as Error);
    }
  }

  async deleteData(did: string): Promise<void> {
    try {
      if (!this.isRunningInBrowser && this.keychain) {
        await new Promise((resolve, reject) => {
          this.keychain.deletePassword({
            account: did,
            service: this.serviceName
          }, (err: Error | null) => {
            if (err) reject(err);
            else resolve(null);
          });
        });
      } else {
        localStorage.removeItem(`${this.serviceName}_${did}`);
      }
    } catch (error) {
      throw new SecureStorageError(`Failed to delete DID: ${did}`, error as Error);
    }
  }
}