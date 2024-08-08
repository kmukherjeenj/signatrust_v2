import { SecureStorage } from './SecureStorage';
import { SecureStorageError } from './errors';
import * as crypto from 'crypto';

export class WindowsSecureStorage implements SecureStorage {
  private isRunningInBrowser: boolean;
  private dpapi: any;

  constructor() {
    this.isRunningInBrowser = typeof window !== 'undefined';
    if (!this.isRunningInBrowser) {
      try {
        this.dpapi = require('win-dpapi');
      } catch (error) {
        console.warn('win-dpapi is not available. Falling back to browser-compatible encryption.');
      }
    }
  }

  private async encrypt(data: string): Promise<string> {
    if (!this.isRunningInBrowser && this.dpapi) {
      return new Promise((resolve, reject) => {
        this.dpapi.protect(data, null, (error: Error | null, encrypted: string) => {
          if (error) reject(new SecureStorageError('Encryption failed', error));
          else resolve(encrypted);
        });
      });
    } else {
      // Fallback to AES encryption for browser context
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${key.toString('hex')}:${encrypted}`;
    }
  }

  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.isRunningInBrowser && this.dpapi) {
      return new Promise((resolve, reject) => {
        this.dpapi.unprotect(encryptedData, null, (error: Error | null, decrypted: string) => {
          if (error) reject(new SecureStorageError('Decryption failed', error));
          else resolve(decrypted);
        });
      });
    } else {
      // Fallback to AES decryption for browser context
      const [ivHex, keyHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const key = Buffer.from(keyHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
  }

  async storeDID(did: string, publicKey: string, encryptedPrivateKey: string): Promise<void> {
    try {
      const data = JSON.stringify({ publicKey, encryptedPrivateKey });
      const encryptedData = await this.encrypt(data);
      if (this.isRunningInBrowser) {
        localStorage.setItem(`${did}_encrypted`, encryptedData);
      } else {
        // Use Node.js fs module for file system operations when not in browser
        const fs = require('fs').promises;
        await fs.writeFile(`${did}.encrypted`, encryptedData);
      }
    } catch (error) {
      throw new SecureStorageError(`Failed to store DID: ${did}`, error as Error);
    }
  }

  async retrieveDID(did: string): Promise<{ publicKey: string; encryptedPrivateKey: string; } | null> {
    try {
      let encryptedData: string;
      if (this.isRunningInBrowser) {
        encryptedData = localStorage.getItem(`${did}_encrypted`) || '';
        if (!encryptedData) return null;
      } else {
        // Use Node.js fs module for file system operations when not in browser
        const fs = require('fs').promises;
        encryptedData = await fs.readFile(`${did}.encrypted`, 'utf8');
      }
      const decryptedData = await this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw new SecureStorageError(`Failed to retrieve DID: ${did}`, error as Error);
    }
  }

  async deleteData(did: string): Promise<void> {
    try {
      if (this.isRunningInBrowser) {
        localStorage.removeItem(`${did}_encrypted`);
      } else {
        // Use Node.js fs module for file system operations when not in browser
        const fs = require('fs').promises;
        await fs.unlink(`${did}.encrypted`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new SecureStorageError(`Failed to delete DID: ${did}`, error as Error);
      }
    }
  }
}