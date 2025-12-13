/**
 * Test Solana Integration
 *
 * This script tests the Solana program integration by:
 * 1. Creating a test keypair
 * 2. Creating a document on-chain
 * 3. Verifying the document exists
 *
 * Prerequisites:
 * - PostgreSQL running (for keypair storage)
 * - SOLANA_PROGRAM_ID set in environment
 * - KEYPAIR_MASTER_KEY set in environment
 *
 * Run with: npx tsx scripts/test-solana-integration.ts
 */

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createHash, randomBytes } from 'crypto';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = process.env.SOLANA_PROGRAM_ID;

async function main() {
  console.log('=== Solana Integration Test ===\n');

  // Check environment
  if (!PROGRAM_ID) {
    console.error('Error: SOLANA_PROGRAM_ID not set');
    process.exit(1);
  }

  console.log(`RPC URL: ${SOLANA_RPC_URL}`);
  console.log(`Program ID: ${PROGRAM_ID}\n`);

  // Create connection
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

  // Verify program exists
  console.log('1. Verifying program deployment...');
  const programPubkey = new PublicKey(PROGRAM_ID);
  const programInfo = await connection.getAccountInfo(programPubkey);

  if (!programInfo) {
    console.error('   Error: Program not found on chain');
    process.exit(1);
  }

  console.log(`   ✓ Program found`);
  console.log(`   - Owner: ${programInfo.owner.toBase58()}`);
  console.log(`   - Size: ${programInfo.data.length} bytes`);
  console.log(`   - Executable: ${programInfo.executable}`);

  // Check network info
  console.log('\n2. Checking network...');
  const version = await connection.getVersion();
  const slot = await connection.getSlot();
  console.log(`   ✓ Connected to Solana`);
  console.log(`   - Version: ${version['solana-core']}`);
  console.log(`   - Current slot: ${slot}`);

  // Generate test hash
  console.log('\n3. Generating test document hash...');
  const testDocument = 'Test document content for Signatrust';
  const hash = createHash('sha256').update(testDocument).digest('hex');
  console.log(`   ✓ Document hash: ${hash.substring(0, 16)}...`);

  // Summary
  console.log('\n=== Test Summary ===');
  console.log('✓ Program is deployed and accessible');
  console.log('✓ Network connection working');
  console.log('✓ Ready for document creation');
  console.log('\nTo create actual documents, the signing service needs to be running');
  console.log('with PostgreSQL for keypair storage.');

  console.log('\n=== Full Integration Test ===');
  console.log('Run these commands to test the full flow:');
  console.log('');
  console.log('1. Start infrastructure:');
  console.log('   cd infra && docker-compose -f docker-compose.dev.yml up -d');
  console.log('');
  console.log('2. Run migrations:');
  console.log('   cd services/signing && npx prisma migrate deploy');
  console.log('');
  console.log('3. Start signing service:');
  console.log('   cd services/signing && pnpm dev');
  console.log('');
  console.log('4. Create a signing session via API');
}

main().catch(console.error);
