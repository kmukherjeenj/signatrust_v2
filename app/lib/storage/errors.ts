export class SecureStorageError extends Error {
    constructor(message: string, public originalError?: Error) {
      super(message);
      this.name = 'SecureStorageError';
    }
  }