import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { Readable } from 'stream';

interface DocumentStorageConfig {
  endpoint?: string; // For LocalStack
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean; // Required for LocalStack
}

interface UploadDocumentParams {
  content: Buffer;
  filename: string;
  mimeType: string;
  encrypt?: boolean;
}

interface UploadResult {
  documentId: string;
  hash: string;
  size: number;
  encryptionKey?: string; // Only if encrypted
  iv?: string; // Only if encrypted
}

interface DownloadResult {
  content: Buffer;
  mimeType: string;
  filename: string;
}

export class DocumentStorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: DocumentStorageConfig) {
    const s3Config: any = {
      region: config.region,
      forcePathStyle: config.forcePathStyle ?? true, // Required for LocalStack
    };

    // Add credentials if provided
    if (config.accessKeyId && config.secretAccessKey) {
      s3Config.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    // Add endpoint if provided (for LocalStack)
    if (config.endpoint) {
      s3Config.endpoint = config.endpoint;
    }

    this.s3Client = new S3Client(s3Config);
    this.bucket = config.bucket;
  }

  /**
   * Generate SHA-256 hash of document
   */
  private hashDocument(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Encrypt document using AES-256-CBC
   */
  private encryptDocument(content: Buffer, key: Buffer, iv: Buffer): Buffer {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([cipher.update(content), cipher.final()]);
  }

  /**
   * Decrypt document using AES-256-CBC
   */
  private decryptDocument(encryptedContent: Buffer, key: Buffer, iv: Buffer): Buffer {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
  }

  /**
   * Upload a document to S3
   * @param params Upload parameters
   * @returns Upload result with document ID and hash
   */
  async uploadDocument(params: UploadDocumentParams): Promise<UploadResult> {
    const { content, filename, mimeType, encrypt = false } = params;

    // Generate document ID
    const documentId = randomBytes(16).toString('hex');
    const hash = this.hashDocument(content);

    let uploadContent: Buffer = content;
    let encryptionKey: string | undefined;
    let iv: string | undefined;

    // Encrypt if requested
    if (encrypt) {
      const keyBuffer = randomBytes(32); // 256-bit key
      const ivBuffer = randomBytes(16); // 128-bit IV
      uploadContent = this.encryptDocument(content, keyBuffer, ivBuffer);
      encryptionKey = keyBuffer.toString('hex');
      iv = ivBuffer.toString('hex');
    }

    // S3 key structure: documents/{documentId}/{filename}
    const key = `documents/${documentId}/${filename}`;

    // Prepare metadata
    const metadata: Record<string, string> = {
      hash,
      originalFilename: filename,
      uploadedAt: new Date().toISOString(),
    };

    if (encrypt) {
      metadata.encrypted = 'true';
      metadata.iv = iv!;
    }

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: uploadContent,
          ContentType: mimeType,
          Metadata: metadata,
          ServerSideEncryption: 'AES256', // S3 server-side encryption
        },
      });

      await upload.done();

      return {
        documentId,
        hash,
        size: content.length,
        encryptionKey,
        iv,
      };
    } catch (error) {
      throw new Error(`Failed to upload document to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download a document from S3
   * @param documentId Document ID
   * @param filename Original filename
   * @param decryptionKey Optional decryption key if document is encrypted
   * @param iv Optional initialization vector if document is encrypted
   * @returns Downloaded document content
   */
  async downloadDocument(
    documentId: string,
    filename: string,
    decryptionKey?: string,
    iv?: string
  ): Promise<DownloadResult> {
    const key = `documents/${documentId}/${filename}`;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Document body is empty');
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as Readable) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
      }
      let content: Buffer = Buffer.concat(chunks);

      // Decrypt if encryption key is provided
      if (decryptionKey && iv) {
        const keyBuffer = Buffer.from(decryptionKey, 'hex');
        const ivBuffer = Buffer.from(iv, 'hex');
        content = this.decryptDocument(content, keyBuffer, ivBuffer) as Buffer;
      }

      return {
        content,
        mimeType: response.ContentType || 'application/octet-stream',
        filename: response.Metadata?.originalFilename || filename,
      };
    } catch (error) {
      throw new Error(`Failed to download document from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a document from S3
   * @param documentId Document ID
   * @param filename Original filename
   */
  async deleteDocument(documentId: string, filename: string): Promise<void> {
    const key = `documents/${documentId}/${filename}`;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete document from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a document exists in S3
   * @param documentId Document ID
   * @param filename Original filename
   * @returns True if document exists
   */
  async documentExists(documentId: string, filename: string): Promise<boolean> {
    const key = `documents/${documentId}/${filename}`;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get document metadata from S3
   * @param documentId Document ID
   * @param filename Original filename
   * @returns Document metadata
   */
  async getDocumentMetadata(documentId: string, filename: string): Promise<Record<string, string>> {
    const key = `documents/${documentId}/${filename}`;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return response.Metadata || {};
    } catch (error) {
      throw new Error(`Failed to get document metadata from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Create and configure the document storage service
 */
export function createDocumentStorageService(): DocumentStorageService {
  const config: DocumentStorageConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'signatrust-documents',
    endpoint: process.env.S3_ENDPOINT || process.env.LOCALSTACK_URL,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test', // LocalStack default
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test', // LocalStack default
    forcePathStyle: true, // Required for LocalStack
  };

  return new DocumentStorageService(config);
}
