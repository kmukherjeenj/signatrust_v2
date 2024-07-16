// lib/storage/PlatformSecureStorage.ts

import { SecureStorage } from './SecureStorage';
import { WindowsTPMStorage } from './windowsTPMStorage';
import { MacOSKeychainStorage } from './macOSKeychainStorage';
import { IOSAndroidSecureEnclaveStorage } from './iOSAndroidSecureEnclaveStorage';
import { IIdentifier } from '@veramo/core';

class FallbackStorage implements SecureStorage {
  private storage: Map<string, any> = new Map();

  async storeDID(identifier: IIdentifier): Promise<void> {
    this.storage.set(`did:${identifier.did}`, identifier);
  }

  async retrieveDID(): Promise<IIdentifier | null> {
    let result: IIdentifier | null = null;
    this.storage.forEach((value, key) => {
      if (key.startsWith('did:')) {
        result = value as IIdentifier;
      }
    });
    return result;
  }

  async storeKey(key: any): Promise<void> {
    this.storage.set('key', key);
  }

  async retrieveKey(): Promise<any> {
    return this.storage.get('key');
  }

  async deleteData(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

export class PlatformSecureStorage implements SecureStorage {
  private storage: SecureStorage;

  constructor() {
    if (typeof window !== 'undefined') {
      // Browser environment
      if (this.isIOS() || this.isAndroid()) {
        this.storage = new IOSAndroidSecureEnclaveStorage();
      } else {
        console.warn('Using fallback storage in browser environment. This is not secure for production use.');
        this.storage = new FallbackStorage();
      }
    } else {
      // Server environment
      if (process.platform === 'win32') {
        this.storage = new WindowsTPMStorage();
      } else if (process.platform === 'darwin') {
        this.storage = new MacOSKeychainStorage();
      } else {
        console.warn('Using fallback storage in server environment. This is not secure for production use.');
        this.storage = new FallbackStorage();
      }
    }
  }

  async storeDID(identifier: IIdentifier): Promise<void> {
    return this.storage.storeDID(identifier);
  }

  async retrieveDID(): Promise<IIdentifier | null> {
    return this.storage.retrieveDID();
  }

  async storeKey(key: any): Promise<void> {
    return this.storage.storeKey(key);
  }

  async retrieveKey(): Promise<any> {
    return this.storage.retrieveKey();
  }

  async deleteData(key: string): Promise<void> {
    return this.storage.deleteData(key);
  }

  private isWindows(): boolean {
    return process.platform === 'win32';
  }

  private isMacOS(): boolean {
    return process.platform === 'darwin';
  }

  private isIOS(): boolean {
    // Implement iOS detection logic
    return false; // Placeholder
  }

  private isAndroid(): boolean {
    // Implement Android detection logic
    return false; // Placeholder
  }
}
