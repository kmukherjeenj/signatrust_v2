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
    const entries = Array.from(this.storage.entries());
    for (const [key, value] of entries) {
      if (key.startsWith('did:')) {
        return value as IIdentifier;
      }
    }
    return null;
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
    const storageType = process.env.SECURE_STORAGE_TYPE || 'fallback';

    switch (storageType) {
      case 'windows':
        this.storage = new WindowsTPMStorage();
        break;
      case 'macos':
        this.storage = new MacOSKeychainStorage();
        break;
      case 'mobile':
        this.storage = new IOSAndroidSecureEnclaveStorage();
        break;
      default:
        console.warn('Using fallback storage. This is not secure for production use.');
        this.storage = new FallbackStorage();
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
}