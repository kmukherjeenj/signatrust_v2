// In utils/loadWallet.server.ts
import fs from 'fs';
import { Keypair } from '@solana/web3.js';

export const loadWallet = (): Keypair => {
  const keypairPath = process.env.SOLANA_KEYPAIR_PATH!;

  if (!keypairPath) {
    throw new Error('SOLANA_KEYPAIR_PATH environment variable is not set');
  }

  if (!fs.existsSync(keypairPath)) {
    throw new Error(`Keypair file not found at path: ${keypairPath}`);
  }

  const keypairData = fs.readFileSync(keypairPath, 'utf-8');
  const secretKey = Uint8Array.from(JSON.parse(keypairData));
  const keypair = Keypair.fromSecretKey(secretKey);
  //const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(keypairData.toString())));
  
  console.log('Loaded keypair:', keypair.publicKey.toBase58());
  return keypair;
};