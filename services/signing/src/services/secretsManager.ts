import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { z } from 'zod';

/**
 * Secret value can be a string or structured data
 */
export type SecretValue = string | Record<string, any>;

/**
 * Configuration for secrets manager
 */
interface SecretsManagerConfig {
  provider: 'env' | 'aws';
  region?: string;
  endpoint?: string;
  cacheTimeout?: number; // Cache TTL in milliseconds (default: 5 minutes)
}

/**
 * Secrets Manager abstraction layer
 * Supports environment variables (dev) and AWS Secrets Manager (production)
 */
export class SecretsManager {
  private provider: 'env' | 'aws';
  private awsClient?: SecretsManagerClient;
  private cache: Map<string, { value: SecretValue; expiresAt: number }> = new Map();
  private cacheTimeout: number;

  constructor(config: SecretsManagerConfig) {
    this.provider = config.provider;
    this.cacheTimeout = config.cacheTimeout || 5 * 60 * 1000; // 5 minutes default

    if (this.provider === 'aws') {
      this.awsClient = new SecretsManagerClient({
        region: config.region || process.env.AWS_REGION || 'us-east-1',
        ...(config.endpoint && { endpoint: config.endpoint }),
      });
    }
  }

  /**
   * Get a secret value
   * @param secretName Name of the secret
   * @param defaultValue Optional default value if secret not found
   * @returns Secret value
   */
  async getSecret(secretName: string, defaultValue?: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return typeof cached.value === 'string' ? cached.value : JSON.stringify(cached.value);
    }

    let value: string;

    if (this.provider === 'env') {
      value = this.getSecretFromEnv(secretName, defaultValue);
    } else {
      value = await this.getSecretFromAWS(secretName);
    }

    // Cache the value
    this.cache.set(secretName, {
      value,
      expiresAt: Date.now() + this.cacheTimeout,
    });

    return value;
  }

  /**
   * Get a secret as JSON object
   * @param secretName Name of the secret
   * @param schema Optional Zod schema for validation
   * @returns Parsed JSON object
   */
  async getSecretJSON<T = any>(secretName: string, schema?: z.ZodSchema<T>): Promise<T> {
    const secretString = await this.getSecret(secretName);

    try {
      const parsed = JSON.parse(secretString);

      if (schema) {
        return schema.parse(parsed);
      }

      return parsed as T;
    } catch (error) {
      throw new Error(`Failed to parse secret '${secretName}' as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get secret from environment variables
   */
  private getSecretFromEnv(secretName: string, defaultValue?: string): string {
    const value = process.env[secretName];

    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Secret '${secretName}' not found in environment variables`);
    }

    return value;
  }

  /**
   * Get secret from AWS Secrets Manager
   */
  private async getSecretFromAWS(secretName: string): Promise<string> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.awsClient.send(command);

      if (response.SecretString) {
        return response.SecretString;
      }

      if (response.SecretBinary) {
        // Decode binary secret
        const buff = Buffer.from(response.SecretBinary);
        return buff.toString('utf-8');
      }

      throw new Error(`Secret '${secretName}' has no value`);
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Secret '${secretName}' not found in AWS Secrets Manager`);
      }
      throw new Error(`Failed to retrieve secret '${secretName}' from AWS: ${error.message}`);
    }
  }

  /**
   * Clear the cache for a specific secret or all secrets
   * @param secretName Optional secret name to clear (clears all if not provided)
   */
  clearCache(secretName?: string): void {
    if (secretName) {
      this.cache.delete(secretName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Refresh a secret value (clear cache and fetch new value)
   * @param secretName Name of the secret to refresh
   * @returns Refreshed secret value
   */
  async refreshSecret(secretName: string): Promise<string> {
    this.clearCache(secretName);
    return this.getSecret(secretName);
  }
}

/**
 * Create and configure the secrets manager
 * Uses environment variables in development, AWS Secrets Manager in production
 */
export function createSecretsManager(): SecretsManager {
  const provider = process.env.SECRETS_PROVIDER as 'env' | 'aws' ||
                   (process.env.NODE_ENV === 'production' ? 'aws' : 'env');

  return new SecretsManager({
    provider,
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_SECRETS_ENDPOINT, // For LocalStack testing
    cacheTimeout: parseInt(process.env.SECRETS_CACHE_TIMEOUT || '300000'), // 5 minutes
  });
}

/**
 * Global secrets manager instance
 */
let secretsManagerInstance: SecretsManager | null = null;

/**
 * Get or create the global secrets manager instance
 */
export function getSecretsManager(): SecretsManager {
  if (!secretsManagerInstance) {
    secretsManagerInstance = createSecretsManager();
  }
  return secretsManagerInstance;
}

/**
 * Helper function to get a secret value
 * @param secretName Name of the secret
 * @param defaultValue Optional default value
 * @returns Secret value
 */
export async function getSecret(secretName: string, defaultValue?: string): Promise<string> {
  const manager = getSecretsManager();
  return manager.getSecret(secretName, defaultValue);
}

/**
 * Helper function to get a secret as JSON
 * @param secretName Name of the secret
 * @param schema Optional Zod schema for validation
 * @returns Parsed JSON object
 */
export async function getSecretJSON<T = any>(secretName: string, schema?: z.ZodSchema<T>): Promise<T> {
  const manager = getSecretsManager();
  return manager.getSecretJSON(secretName, schema);
}
