/**
 * Debug script to verify chain record and document account state
 */

import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';

const prisma = new PrismaClient();

async function main() {
  // Get the most recent session with a chain record
  const session = await prisma.signingSession.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { signers: true },
  });

  if (!session) {
    console.log('No sessions found');
    return;
  }

  console.log('Session ID:', session.id);
  console.log('Chain Record:', session.chainRecord);
  console.log('Status:', session.status);
  console.log('Signers:', session.signers.map(s => ({ did: s.did, status: s.status })));

  if (session.chainRecord) {
    // Verify it's a valid public key
    try {
      const pubkey = new PublicKey(session.chainRecord);
      console.log('\nChain Record is valid PublicKey:', pubkey.toBase58());

      // Check if account exists on chain
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const accountInfo = await connection.getAccountInfo(pubkey);

      if (accountInfo) {
        console.log('\nAccount exists on chain:');
        console.log('  Owner:', accountInfo.owner.toBase58());
        console.log('  Lamports:', accountInfo.lamports);
        console.log('  Data length:', accountInfo.data.length);
        console.log('  Data (first 100 bytes hex):', accountInfo.data.slice(0, 100).toString('hex'));
      } else {
        console.log('\nAccount does NOT exist on chain!');
      }
    } catch (e) {
      console.log('\nChain Record is NOT a valid public key:', e);
      console.log('It might be a transaction signature instead');
    }
  }

  // Check outbox events
  const outboxEvents = await prisma.outbox.findMany({
    where: { type: { startsWith: 'blockchain.' } },
    orderBy: { occurredAt: 'desc' },
    take: 10,
  });

  console.log('\nRecent blockchain outbox events:');
  for (const event of outboxEvents) {
    console.log(`  ${event.type}: processed=${!!event.processedAt}, attempts=${event.attemptCount}`);
    console.log('    payload:', JSON.stringify(event.payload));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
