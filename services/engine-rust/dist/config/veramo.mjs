import { createAgent } from '@veramo/core';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { DIDManager } from '@veramo/did-manager';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { KeyStore, DIDStore, PrivateKeyStore, DataStore, DataStoreORM, Entities, migrations } from '@veramo/data-store';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { DataSource } from 'typeorm';
//import { QueueServiceClient } from '@azure/storage-queue';
import { QueueServiceClient } from '@azure/storage-queue';
import logger from './logger.js';
import NodeCache from 'node-cache';
import { config } from 'dotenv';
import { SolanaDIDProvider } from '../providers/SolDIDProvider.js';
// Load environment variables
config();
// Log the Azure Storage Connection String (be careful with this in production)
console.log('AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? 'Set' : 'Not set');
// In-memory cache for rate limiting and general caching
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
// Azure Queue Service for async processing
//let queueClient;
let queueClient = null;
try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set in the environment variables');
    }
    logger.info('Initializing Azure Queue Service Client');
    const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
    queueClient = queueServiceClient.getQueueClient('identity-tasks');
    // Ensure the queue exists
    queueClient.createIfNotExists().then(() => {
        logger.info('Azure Queue "identity-tasks" is ready');
    }).catch((error) => {
        logger.error('Failed to create Azure Queue:', error);
    });
}
catch (error) {
    logger.error('Failed to initialize Azure Queue Service Client:', error);
    if (error instanceof Error) {
        logger.error('Error message:', error.message);
        logger.error('Error stack:', error.stack);
    }
    queueClient = null;
}
// Create a secure encryption key for the SecretBox
const secretBox = new SecretBox(await SecretBox.createSecretKey());
// Create DataSource for in-memory SQLite database
const dbConnection = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
});
// Create and configure the Veramo agent
export const agent = createAgent({
    plugins: [
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, secretBox)),
            },
        }),
        new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: 'did:sol',
            providers: {
                'did:ethr': new EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'mainnet',
                    rpcUrl: process.env.ETHEREUM_RPC_URL,
                }),
                'did:web': new WebDIDProvider({
                    defaultKms: 'local',
                }),
                'did:sol': new SolanaDIDProvider({
                    //defaultKms: 'local',
                    programId: process.env.SOLANA_PROGRAM_ID || 'default-program-id',
                    //microserviceUrl: process.env.SOLANA_MICROSERVICE_URL || 'http://localhost:3001',
                    //network: 'devnet', // or 'mainnet-beta' for production
                    network: process.env.SOLANA_NETWORK || 'testnet',
                    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com',
                }),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({
                ...ethrDidResolver({
                    networks: [
                        {
                            name: 'mainnet',
                            rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID
                        },
                        {
                            name: 'goerli',
                            rpcUrl: process.env.ETHEREUM_TESTNET_RPC_URL || 'https://goerli.infura.io/v3/' + process.env.INFURA_PROJECT_ID
                        }
                    ]
                }),
                ...webDidResolver(),
            }),
        }),
        new CredentialPlugin(),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
    ],
});
// Rate limiting function using in-memory cache
export const rateLimiter = async (key, limit) => {
    const current = cache.get(key) || 0;
    if (current >= limit) {
        return false;
    }
    cache.set(key, current + 1, 60); // 1 minute window
    return true;
};
// Function to add a task to the Azure Queue
export const addTask = async (task) => {
    if (!queueClient) {
        logger.warn('Azure Queue is not initialized. Task will not be added.');
        return;
    }
    try {
        await queueClient.sendMessage(Buffer.from(JSON.stringify(task)).toString('base64'));
        logger.info('Task added to Azure Queue successfully');
    }
    catch (error) {
        logger.error('Failed to add task to Azure Queue:', error);
    }
};
// Initialize DataSource
dbConnection.initialize().then(() => {
    logger.info('Database connection initialized successfully');
}).catch((err) => {
    logger.error('Error during initialization:', err);
    process.exit(1);
});
logger.info('Veramo agent initialized successfully for strict identity mobility');
// Export the cache and queueClient
export { cache, queueClient };
