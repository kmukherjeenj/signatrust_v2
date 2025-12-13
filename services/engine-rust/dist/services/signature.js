"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureService = void 0;
const veramo_1 = require("../config/veramo");
const logger_1 = __importDefault(require("../config/logger"));
const errors_1 = require("../utils/errors");
class SignatureService {
    async signDocument(did, document) {
        try {
            const credential = await veramo_1.agent.createVerifiableCredential({
                credential: {
                    issuer: { id: did },
                    credentialSubject: {
                        id: 'did:example:document',
                        document: document,
                    },
                },
                proofFormat: 'jwt',
            });
            logger_1.default.info(`Document signed by ${did}`);
            return credential;
        }
        catch (error) {
            logger_1.default.error(`Failed to sign document for ${did}`, { error, document });
            throw (0, errors_1.throwAppError)('Failed to sign document', 500);
        }
    }
    async verifySignature(signedDocument) {
        try {
            const result = await veramo_1.agent.verifyCredential({ credential: signedDocument });
            logger_1.default.info(`Signature verification result: ${result.verified}`);
            return result.verified;
        }
        catch (error) {
            logger_1.default.error('Failed to verify signature', { error, signedDocument });
            throw (0, errors_1.throwAppError)('Failed to verify signature', 500);
        }
    }
    async createPresentation(credentials, holder) {
        try {
            const presentation = await veramo_1.agent.createVerifiablePresentation({
                presentation: {
                    holder: holder,
                    verifiableCredential: credentials,
                },
                proofFormat: 'jwt',
            });
            logger_1.default.info(`Presentation created for ${holder}`);
            return presentation;
        }
        catch (error) {
            logger_1.default.error(`Failed to create presentation for ${holder}`, { error, credentials });
            throw (0, errors_1.throwAppError)('Failed to create presentation', 500);
        }
    }
}
exports.SignatureService = SignatureService;
