/**
 * Debug script to decode document account data from Solana
 */

import { Connection, PublicKey } from '@solana/web3.js';

async function main() {
  const documentPubkey = new PublicKey('2NcKhPY8hh6yNW12WbfrPuqCHGr5LHHPFuudfUeSAN8G');
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const accountInfo = await connection.getAccountInfo(documentPubkey);
  if (!accountInfo) {
    console.log('Account not found');
    return;
  }

  const data = accountInfo.data;
  let offset = 0;

  // document_hash: [u8; 32]
  const documentHash = data.slice(offset, offset + 32);
  offset += 32;
  console.log('Document Hash:', documentHash.toString('hex'));

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
  console.log('Signatures Count:', signaturesCount);

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
  console.log('Created At:', new Date(createdAt * 1000).toISOString());

  // updated_at: i64
  const updatedAt = Number(data.readBigInt64LE(offset));
  offset += 8;
  console.log('Updated At:', new Date(updatedAt * 1000).toISOString());

  // creator: Pubkey
  const creator = new PublicKey(data.slice(offset, offset + 32));
  console.log('Creator:', creator.toBase58());

  console.log('\nTotal bytes read:', offset + 32);
  console.log('Account data size:', data.length);

  // Now check the keypairs in DB
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const keypairs = await prisma.keypair.findMany();
  console.log('\n=== Stored Keypairs ===');
  for (const kp of keypairs) {
    console.log(`  DID: ${kp.did} -> PublicKey: ${kp.publicKey}`);
  }

  // Check if signers match
  console.log('\n=== Signer Match Check ===');
  for (const signerPubkey of signers) {
    const found = keypairs.find(kp => kp.publicKey === signerPubkey);
    if (found) {
      console.log(`  ✓ ${signerPubkey} -> ${found.did}`);
    } else {
      console.log(`  ✗ ${signerPubkey} -> NOT FOUND IN DB!`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
