"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
const veramo_1 = require("../config/veramo");
const logger_1 = __importDefault(require("../config/logger"));
const errors_1 = require("../utils/errors");
/**
 * Identity Service for Mobile Identities
 *
 * This service implements identity mobility principles using Veramo's agent.
 * Identity mobility allows users to create and manage their digital identities
 * independently of any specific application or platform.
 *
 * Key aspects of this implementation:
 * 1. Stateless operation: No identity information is stored server-side.
 * 2. DID creation and resolution: Supports creating new DIDs and resolving existing ones.
 * 3. Key management: Allows adding and removing keys associated with a DID.
 *
 * The decentralized approach used here empowers users to have full control over their
 * digital identities, aligning with the principles of self-sovereign identity.
 */
class IdentityService {
    /**
     * Creates a new decentralized identity (DID)
     *
     * @returns A promise resolving to an object containing the DID and its associated keys
     */
    async createIdentity() {
        try {
            const identity = await veramo_1.agent.didManagerCreate({ provider: 'did:ethr' });
            logger_1.default.info(`Identity created: ${identity.did}`);
            // Return only the DID and keys, not storing any information server-side
            return { did: identity.did, keys: identity.keys };
        }
        catch (error) {
            logger_1.default.error('Failed to create identity', { error });
            throw (0, errors_1.throwAppError)('Failed to create identity', 500);
        }
    }
    /**
     * Resolves a DID to its DID document
     *
     * @param did - The DID to resolve
     * @returns A promise resolving to the full identifier object
     */
    async resolveIdentity(did) {
        try {
            const identity = await veramo_1.agent.didManagerGet({ did });
            logger_1.default.info(`Identity resolved: ${did}`);
            return identity;
        }
        catch (error) {
            logger_1.default.error(`Failed to resolve identity: ${did}`, { error });
            throw (0, errors_1.throwAppError)('Failed to resolve identity', 404);
        }
    }
    /**
     * Adds a new key to an existing DID
     *
     * @param did - The DID to add the key to
     * @param key - The key to add
     * @returns A promise resolving to the updated identifier object
     */
    async addKey(did, key) {
        try {
            const updatedIdentity = await veramo_1.agent.didManagerAddKey({ did, key });
            logger_1.default.info(`Key added to identity: ${did}`);
            return updatedIdentity;
        }
        catch (error) {
            logger_1.default.error(`Failed to add key to identity: ${did}`, { error });
            throw (0, errors_1.throwAppError)('Failed to add key to identity', 500);
        }
    }
    /**
     * Removes a key from an existing DID
     *
     * @param did - The DID to remove the key from
     * @param kid - The ID of the key to remove
     * @returns A promise resolving to the updated identifier object
     */
    async removeKey(did, kid) {
        try {
            const updatedIdentity = await veramo_1.agent.didManagerRemoveKey({ did, kid });
            logger_1.default.info(`Key removed from identity: ${did}`);
            return updatedIdentity;
        }
        catch (error) {
            logger_1.default.error(`Failed to remove key from identity: ${did}`, { error });
            throw (0, errors_1.throwAppError)('Failed to remove key from identity', 500);
        }
    }
}
exports.IdentityService = IdentityService;
/**
 * Testing the Identity Service:
 *
 * 1. Create a new identity:
 *    const identityService = new IdentityService()
 *    const result = await identityService.createIdentity()
 *    if (result) {
 *      console.log(result.did, result.keys) // Should output a DID string and an array of keys
 *    } else {
 *      console.log('Failed to create identity')
 *    }
 *
 * 2. Resolve an identity:
 *    const resolved = await identityService.resolveIdentity(did)
 *    if (resolved) {
 *      console.log(resolved) // Should output the full identifier object
 *    } else {
 *      console.log('Failed to resolve identity')
 *    }
 *
 * 3. Add a key to an identity:
 *    const newKey = { kid: 'newKey', type: 'Secp256k1', publicKeyHex: '0x...' }
 *    const updatedWithNewKey = await identityService.addKey(did, newKey)
 *    if (updatedWithNewKey) {
 *      console.log(updatedWithNewKey) // Should output the updated identifier object
 *    } else {
 *      console.log('Failed to add key')
 *    }
 *
 * 4. Remove a key from an identity:
 *    const updatedAfterRemoval = await identityService.removeKey(did, 'newKey')
 *    if (updatedAfterRemoval) {
 *      console.log(updatedAfterRemoval) // Should output the updated identifier object
 *    } else {
 *      console.log('Failed to remove key')
 *    }
 *
 * These tests demonstrate the core functionalities of identity creation, resolution,
 * and key management, all essential aspects of decentralized identity mobility.
 *
 * Note: In a real-world scenario, the client application would be responsible for
 * securely storing the DID and keys returned by createIdentity(). These would then
 * be provided by the client for subsequent operations. */ 
