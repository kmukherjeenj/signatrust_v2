import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DocumentStorageService } from './documentStorage.js';
import { randomBytes } from 'crypto';

// These tests require LocalStack to be running
// Run: docker compose -f infra/docker-compose.dev.yml up localstack

describe('DocumentStorageService', () => {
  let storageService: DocumentStorageService;
  const testBucket = 'signatrust-documents-test';

  beforeAll(() => {
    storageService = new DocumentStorageService({
      region: 'us-east-1',
      bucket: testBucket,
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
      accessKeyId: 'test',
      secretAccessKey: 'test',
      forcePathStyle: true,
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const content = Buffer.from('Test document content');
      const filename = 'test-document.pdf';
      const mimeType = 'application/pdf';

      const result = await storageService.uploadDocument({
        content,
        filename,
        mimeType,
        encrypt: false,
      });

      expect(result).toHaveProperty('documentId');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('size');
      expect(result.documentId).toMatch(/^[0-9a-f]{32}$/);
      expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(result.size).toBe(content.length);
      expect(result.encryptionKey).toBeUndefined();
    }, 30000);

    it('should upload an encrypted document', async () => {
      const content = Buffer.from('Sensitive document content');
      const filename = 'sensitive.pdf';
      const mimeType = 'application/pdf';

      const result = await storageService.uploadDocument({
        content,
        filename,
        mimeType,
        encrypt: true,
      });

      expect(result).toHaveProperty('encryptionKey');
      expect(result).toHaveProperty('iv');
      expect(result.encryptionKey).toMatch(/^[0-9a-f]{64}$/); // 32 bytes = 64 hex
      expect(result.iv).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex
    }, 30000);

    it('should generate unique document IDs', async () => {
      const content = Buffer.from('Test');

      const result1 = await storageService.uploadDocument({
        content,
        filename: 'test1.txt',
        mimeType: 'text/plain',
      });

      const result2 = await storageService.uploadDocument({
        content,
        filename: 'test2.txt',
        mimeType: 'text/plain',
      });

      expect(result1.documentId).not.toBe(result2.documentId);
    }, 30000);
  });

  describe('downloadDocument', () => {
    it('should download an uploaded document', async () => {
      const originalContent = Buffer.from('Download test content');
      const filename = 'download-test.txt';

      const uploadResult = await storageService.uploadDocument({
        content: originalContent,
        filename,
        mimeType: 'text/plain',
      });

      const downloadResult = await storageService.downloadDocument(
        uploadResult.documentId,
        filename
      );

      expect(downloadResult.content.toString()).toBe(originalContent.toString());
      expect(downloadResult.filename).toBe(filename);
      expect(downloadResult.mimeType).toBe('text/plain');
    }, 30000);

    it('should download and decrypt an encrypted document', async () => {
      const originalContent = Buffer.from('Encrypted download test');
      const filename = 'encrypted-download.txt';

      const uploadResult = await storageService.uploadDocument({
        content: originalContent,
        filename,
        mimeType: 'text/plain',
        encrypt: true,
      });

      const downloadResult = await storageService.downloadDocument(
        uploadResult.documentId,
        filename,
        uploadResult.encryptionKey,
        uploadResult.iv
      );

      expect(downloadResult.content.toString()).toBe(originalContent.toString());
    }, 30000);

    it('should throw error for non-existent document', async () => {
      await expect(
        storageService.downloadDocument('nonexistent-id', 'fake.txt')
      ).rejects.toThrow();
    }, 30000);
  });

  describe('documentExists', () => {
    it('should return true for existing document', async () => {
      const content = Buffer.from('Existence test');
      const filename = 'exists-test.txt';

      const uploadResult = await storageService.uploadDocument({
        content,
        filename,
        mimeType: 'text/plain',
      });

      const exists = await storageService.documentExists(
        uploadResult.documentId,
        filename
      );

      expect(exists).toBe(true);
    }, 30000);

    it('should return false for non-existent document', async () => {
      const exists = await storageService.documentExists(
        'nonexistent-id',
        'fake.txt'
      );

      expect(exists).toBe(false);
    }, 30000);
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      const content = Buffer.from('Delete test');
      const filename = 'delete-test.txt';

      const uploadResult = await storageService.uploadDocument({
        content,
        filename,
        mimeType: 'text/plain',
      });

      // Verify it exists
      let exists = await storageService.documentExists(
        uploadResult.documentId,
        filename
      );
      expect(exists).toBe(true);

      // Delete it
      await storageService.deleteDocument(uploadResult.documentId, filename);

      // Verify it's gone
      exists = await storageService.documentExists(
        uploadResult.documentId,
        filename
      );
      expect(exists).toBe(false);
    }, 30000);
  });

  describe('getDocumentMetadata', () => {
    it('should retrieve document metadata', async () => {
      const content = Buffer.from('Metadata test');
      const filename = 'metadata-test.txt';

      const uploadResult = await storageService.uploadDocument({
        content,
        filename,
        mimeType: 'text/plain',
      });

      const metadata = await storageService.getDocumentMetadata(
        uploadResult.documentId,
        filename
      );

      expect(metadata).toHaveProperty('hash');
      expect(metadata).toHaveProperty('originalFilename');
      expect(metadata).toHaveProperty('uploadedAt');
      expect(metadata.hash).toBe(uploadResult.hash);
      expect(metadata.originalFilename).toBe(filename);
    }, 30000);
  });
});
