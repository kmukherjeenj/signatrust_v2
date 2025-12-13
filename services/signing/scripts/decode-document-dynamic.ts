/**
 * Debug script to decode the LATEST document account from chain
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

  if (!session || !session.chainRecord) {
    console.log('No session with chain record found');
    return;
  }

  console.log('Session ID:', session.id);
  console.log('Chain Record:', session.chainRecord);

  const documentPubkey = new PublicKey(session.chainRecord);
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const accountInfo = await connection.getAccountInfo(documentPubkey);
  if (!accountInfo) {
    console.log('Account not found on chain');
    return;
  }

  const data = accountInfo.data;
  let offset = 0;

  // document_hash: [u8; 32]
  const documentHash = data.slice(offset, offset + 32);
  offset += 32;
  console.log('\nDocument Hash:', documentHash.toString('hex'));

  // status: u8 (enum)
  const status = data[offset];
  offset += 1;
  console.log('Status:', status, ['Pending', 'Signed', 'Completed'][status]);

  // signers: Vec<Pubkey> - length (u32) + n * 32 bytes
  const signersCount = data.readUInt32LE(offset);
  offset += 4;
  console.log('Signers Count:', signersCount);

  const signers: string[] = [];
  for (let i = 0; i < signersCount; i++) {
    const pubkey = new PublicKey(data.slice(offset, offset + 32));
    signers.push(pubkey.toBase58());
    offset += 32;
  }
  console.log('Signers:', signers);

  // signatures: Vec<Signature> - length (u32) + n * (32 + 64 + 8) bytes
  const signaturesCount = data.readUInt32LE(offset);
  offset += 4;
  console.log('\nSignatures Count:', signaturesCount);

  for (let i = 0; i < signaturesCount; i++) {
    const signer = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const signature = data.slice(offset, offset + 64);
    offset += 64;
    const timestamp = Number(data.readBigInt64LE(offset));
    offset += 8;
    console.log(`  Signature ${i}:`, {
      signer: signer.toBase58(),
      signature: signature.toString('hex').substring(0, 32) + '...',
      timestamp: new Date(timestamp * 1000).toISOString(),
    });
  }

  // created_at: i64
  const createdAt = Number(data.readBigInt64LE(offset));
  offset += 8;
  console.log('\nCreated At:', new Date(createdAt * 1000).toISOString());

  // updated_at: i64
  const updatedAt = Number(data.readBigInt64LE(offset));
  offset += 8;
  console.log('Updated At:', new Date(updatedAt * 1000).toISOString());

  // creator: Pubkey
  const creator = new PublicKey(data.slice(offset, offset + 32));
  console.log('Creator:', creator.toBase58());

  // Check keypairs
  const keypairs = await prisma.keypair.findMany();
  console.log('\n=== Keypair Match Check ===');
  for (const signerPubkey of signers) {
    const found = keypairs.find(kp => kp.publicKey === signerPubkey);
    if (found) {
      console.log(`  ✓ ${signerPubkey} -> ${found.did}`);
    } else {
      console.log(`  ✗ ${signerPubkey} -> NOT FOUND IN DB!`);
    }
  }

  // Check outbox
  const outboxEvents = await prisma.outbox.findMany({
    where: { type: { startsWith: 'blockchain.' } },
    orderBy: { occurredAt: 'desc' },
    take: 10,
  });

  console.log('\n=== Outbox Events ===');
  for (const event of outboxEvents) {
    const processedStatus = event.processedAt ? '✓' : `✗ (attempts: ${event.attemptCount})`;
    console.log(`  ${processedStatus} ${event.type}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
