// lib/storage/PlatformSecureStorage.ts

import { SecureStorage } from './SecureStorage';
import { WindowsTPMStorage } from './windowsTPMStorage';
import { MacOSKeychainStorage } from './macOSKeychainStorage';
import { IOSAndroidSecureEnclaveStorage } from './iOSAndroidSecureEnclaveStorage';
import { IIdentifier } from '@veramo/core';

export class PlatformSecureStorage implements SecureStorage {
  private storage: SecureStorage;

  constructor() {
    if (this.isWindows()) {
      this.storage = new WindowsTPMStorage();
    } else if (this.isMacOS()) {
      this.storage = new MacOSKeychainStorage();
    } else if (this.isIOS() || this.isAndroid()) {
      this.storage = new IOSAndroidSecureEnclaveStorage();
    } else {
      throw new Error('Unsupported platform');
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