import dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';
dotenv.config();
const getEnv = (key, defaultValue) => {
    const value = process.env[key];
    if (value === undefined) {
        console.warn(`Warning: ${key} is not set in the environment variables. Using default value.`);
        return defaultValue;
    }
    return value;
};
const parseJsonEnv = (key, defaultValue) => {
    const value = process.env[key];
    if (value === undefined) {
        console.warn(`Warning: ${key} is not set in the environment variables. Using default value.`);
        return defaultValue;
    }
    try {
        return JSON.parse(value);
    }
    catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return defaultValue;
    }
};
const loadKeypairFromFile = (path) => {
    try {
        const keypairString = fs.readFileSync(path, 'utf-8');
        const keypairData = JSON.parse(keypairString);
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
    }
    catch (error) {
        console.error(`Error loading keypair from file: ${path}`, error);
        return null;
    }
};
const config = {
    solana: {
        network: getEnv('SOLANA_NETWORK', 'devnet'),
        rpcUrl: getEnv('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
        programId: getEnv('SOLANA_PROGRAM_ID', '9WhJNvronsWobQzuQRfXpJdAFYMp1nPEsxGJpgndWYdg'),
        payerPrivateKey: parseJsonEnv('SOLANA_PAYER_PRIVATE_KEY', []),
        cluster: getEnv('SOLANA_CLUSTER', 'https://api.devnet.solana.com'),
        keypairPath: getEnv('SOLANA_KEYPAIR_PATH', 'c:\\temp\\new_signatrust_keypair.json'),
        feePayer: getEnv('SOLANA_FEE_PAYER', '5zGhYAwX1qMUwQ5zyVP3Pzgw5MWUnjUkKmNgo9bEVxNH'),
        payerKeypair: null, // Initialize as null
    },
    zkProof: {
        circuitWasmPath: getEnv('ZK_PROOF_CIRCUIT_WASM_PATH', './circuits/auth.wasm'),
        circuitPath: getEnv('ZK_PROOF_CIRCUIT_PATH', './circuits/auth.zkey'),
        zkeyPath: getEnv('ZK_PROOF_ZKEY_PATH', './circuits/circuit_final.zkey'),
        verificationKey: getEnv('ZK_PROOF_VERIFICATION_KEY', './circuits/verification_key.json'),
    },
    jwt: {
        secret: getEnv('JWT_SECRET', 'E3F36B938A856BEF6EA6417F9ACDB'),
        expiresIn: getEnv('JWT_EXPIRES_IN', '30d'),
    },
};
// Load and set the payer keypair
if (config.solana.payerPrivateKey.length > 0) {
    config.solana.payerKeypair = Keypair.fromSecretKey(Uint8Array.from(config.solana.payerPrivateKey));
}
else {
    const loadedKeypair = loadKeypairFromFile(config.solana.keypairPath);
    if (loadedKeypair) {
        config.solana.payerKeypair = loadedKeypair;
    }
    else {
        console.error('Error: Unable to load Solana payer keypair. Solana operations will fail.');
        process.exit(1);
    }
}
// Validate critical configurations
if (!config.solana.programId || config.solana.programId === 'default-program-id-replace-before-use') {
    console.warn('Warning: SOLANA_PROGRAM_ID is not set or using the default value. Make sure to set it before deploying to production.');
}
if (!config.solana.payerKeypair) {
    console.error('Error: Unable to load Solana payer keypair. Solana operations will fail.');
    process.exit(1);
}
if (!fs.existsSync(config.zkProof.circuitPath)) {
    console.warn(`Warning: ZK Proof circuit not found at ${config.zkProof.circuitPath}`);
}
if (!fs.existsSync(config.zkProof.verificationKey)) {
    console.warn(`Warning: ZK Proof verification key not found at ${config.zkProof.verificationKey}`);
}
// Add more validations as needed
export { config };
