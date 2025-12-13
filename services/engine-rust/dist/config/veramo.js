"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.producer = exports.redisClient = exports.rateLimiter = exports.agent = void 0;
const core_1 = require("@veramo/core");
const did_resolver_1 = require("@veramo/did-resolver");
const key_manager_1 = require("@veramo/key-manager");
const did_manager_1 = require("@veramo/did-manager");
const credential_w3c_1 = require("@veramo/credential-w3c");
const did_provider_ethr_1 = require("@veramo/did-provider-ethr");
const did_provider_web_1 = require("@veramo/did-provider-web");
const kms_local_1 = require("@veramo/kms-local");
const data_store_1 = require("@veramo/data-store");
const did_resolver_2 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const web_did_resolver_1 = require("web-did-resolver");
const typeorm_1 = require("typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const kafkajs_1 = require("kafkajs");
const logger_1 = __importDefault(require("./logger"));
/**
 * Identity Mobility and Veramo Integration
 *
 * This file sets up a Veramo agent configured for strict identity mobility and scalability.
 * Strict identity mobility means that no permanent identity information is stored within the application.
 *
 * Key aspects of this implementation:
 * 1. Use of in-memory configuration: Ensures that no identity information is persisted by the application.
 * 2. Support for multiple DID methods: Allows for interoperability and user choice.
 * 3. Decentralized resolution: DIDs can be resolved without relying on centralized servers.
 * 4. Scalability features: Incorporates caching and asynchronous processing for improved performance.
 *
 * Decentralized Methodologies:
 * - DIDs (did:ethr and did:web methods supported) allow for decentralized, self-sovereign identities.
 * - The EthrDIDProvider enables creation and management of Ethereum-based DIDs.
 * - The WebDIDProvider allows for DIDs that can be resolved via standard web protocols.
 * - The DIDResolverPlugin enables resolution of DIDs without relying on centralized authorities.
 */
// Redis client for caching
const redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.redisClient = redisClient;
// Kafka client for async processing
const kafka = new kafkajs_1.Kafka({
    clientId: 'identity-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});
const producer = kafka.producer();
exports.producer = producer;
// Create DataSource for in-memory SQLite database
const dbConnection = new typeorm_1.DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: false,
    migrations: data_store_1.migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: data_store_1.Entities,
});
// Create and configure the Veramo agent
exports.agent = (0, core_1.createAgent)({
    plugins: [
        new key_manager_1.KeyManager({
            store: new data_store_1.KeyStore(dbConnection),
            kms: {
                local: new kms_local_1.KeyManagementSystem(new data_store_1.PrivateKeyStore(dbConnection)),
            },
        }),
        new did_manager_1.DIDManager({
            store: new data_store_1.DIDStore(dbConnection),
            defaultProvider: 'did:ethr',
            providers: {
                'did:ethr': new did_provider_ethr_1.EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'mainnet',
                    rpcUrl: process.env.ETHEREUM_RPC_URL,
                }),
                'did:web': new did_provider_web_1.WebDIDProvider({
                    defaultKms: 'local',
                }),
            },
        }),
        new did_resolver_1.DIDResolverPlugin({
            resolver: new did_resolver_2.Resolver({
                ...(0, ethr_did_resolver_1.getResolver)({ infuraProjectId: (_a = process.env.ETHEREUM_RPC_URL) === null || _a === void 0 ? void 0 : _a.split('/').pop() }),
                ...(0, web_did_resolver_1.getResolver)(),
            }),
        }),
        new credential_w3c_1.CredentialPlugin(),
        new data_store_1.DataStore(dbConnection),
        new data_store_1.DataStoreORM(dbConnection),
    ],
});
// Rate limiting function
const rateLimiter = async (key, limit) => {
    const current = await redisClient.incr(key);
    if (current === 1) {
        await redisClient.expire(key, 60); // 1 minute window
    }
    return current <= limit;
};
exports.rateLimiter = rateLimiter;
// Initialize DataSource and Kafka producer
dbConnection.initialize().then(() => {
    logger_1.default.info('Database connection initialized successfully');
    return producer.connect();
}).then(() => {
    logger_1.default.info('Kafka producer connected successfully');
}).catch((err) => {
    logger_1.default.error('Error during initialization:', err);
    process.exit(1);
});
logger_1.default.info('Veramo agent initialized successfully for strict identity mobility');
