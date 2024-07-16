// lib/storage/SecureStorage.ts

import { IIdentifier } from '@veramo/core';

export interface SecureStorage {
  storeDID(identifier: IIdentifier): Promise<void>;
  retrieveDID(): Promise<IIdentifier | null>;
  storeKey(key: any): Promise<void>;
  retrieveKey(): Promise<any>;
  deleteData(key: string): Promise<void>;
}