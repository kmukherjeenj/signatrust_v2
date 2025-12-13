const web3 = require('@solana/web3.js');
const bs58 = require('bs58');

// Generate a new keypair
const keypair = web3.Keypair.generate();

// Get the public key (for reference)
console.log("Public Key:", keypair.publicKey.toBase58());

// Get the private key in Base58 encoding
const privateKeyBase58 = bs58.encode(keypair.secretKey);
console.log("Private Key (Base58):", privateKeyBase58);
