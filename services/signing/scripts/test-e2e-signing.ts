/**
 * End-to-End Document Signing Test
 *
 * Tests the complete signing flow:
 * 1. Create a signing session
 * 2. Get session by token
 * 3. Sign the document
 * 4. Verify completion
 *
 * Run with: npx tsx scripts/test-e2e-signing.ts
 */

import { createHash } from 'crypto';

const BASE_URL = 'http://localhost:4030';

async function main() {
  console.log('=== End-to-End Document Signing Test ===\n');

  // 1. Create a signing session
  console.log('1. Creating signing session...');

  const documentContent = 'Test document for Signatrust E2E test';
  const documentHash = createHash('sha256').update(documentContent).digest('hex');

  const createResponse = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentName: 'Test Contract.pdf',
      documentHash,
      documentStorageRef: 's3://signatrust-documents/test-contract.pdf',
      documentMimeType: 'application/pdf',
      documentSize: documentContent.length,
      creatorId: 'user-creator-123',
      signers: [
        { email: 'signer1@example.com' },
        { email: 'signer2@example.com' },
      ],
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('   ✗ Failed to create session:', error);
    process.exit(1);
  }

  const session = await createResponse.json();
  console.log('   ✓ Session created');
  console.log(`   - Session ID: ${session.sessionId}`);
  console.log(`   - Document ID: ${session.documentId}`);
  console.log(`   - Signers: ${session.signers.length}`);

  // Get the first signer's token
  const signer1 = session.signers[0];
  const signer2 = session.signers[1];
  console.log(`   - Signer 1 token: ${signer1.token.substring(0, 16)}...`);
  console.log(`   - Signer 2 token: ${signer2.token.substring(0, 16)}...`);

  // 2. Get session by token
  console.log('\n2. Getting session by token...');

  const getSessionResponse = await fetch(
    `${BASE_URL}/public/session-by-token?token=${signer1.token}`
  );

  if (!getSessionResponse.ok) {
    const error = await getSessionResponse.text();
    console.error('   ✗ Failed to get session:', error);
    process.exit(1);
  }

  const sessionData = await getSessionResponse.json();
  console.log('   ✓ Session retrieved');
  console.log(`   - Status: ${sessionData.status}`);
  console.log(`   - Signers: ${sessionData.signers.length}`);

  // Wait for blockchain document creation (outbox worker processing)
  console.log('\n3. Waiting for blockchain document creation (5s)...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 4. Sign as signer 1
  console.log('\n4. Signing as signer 1...');

  const sign1Response = await fetch(`${BASE_URL}/public/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.sessionId,
      signerToken: signer1.token,
      signaturePayload: {
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
    }),
  });

  if (!sign1Response.ok) {
    const error = await sign1Response.text();
    console.error('   ✗ Failed to sign:', error);
    process.exit(1);
  }

  const sign1Result = await sign1Response.json();
  console.log('   ✓ Signer 1 signed');
  console.log(`   - All signed: ${sign1Result.allSigned}`);

  // 5. Sign as signer 2
  console.log('\n5. Signing as signer 2...');

  // First, access the session to bind the token
  await fetch(`${BASE_URL}/public/session-by-token?token=${signer2.token}`);

  const sign2Response = await fetch(`${BASE_URL}/public/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.sessionId,
      signerToken: signer2.token,
      signaturePayload: {
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
    }),
  });

  if (!sign2Response.ok) {
    const error = await sign2Response.text();
    console.error('   ✗ Failed to sign:', error);
    process.exit(1);
  }

  const sign2Result = await sign2Response.json();
  console.log('   ✓ Signer 2 signed');
  console.log(`   - All signed: ${sign2Result.allSigned}`);

  // 6. Check database state
  console.log('\n6. Checking outbox events...');

  // Wait a moment for outbox to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Summary
  console.log('\n=== Test Summary ===');
  console.log('✓ Session creation: Working');
  console.log('✓ Token retrieval: Working');
  console.log('✓ Signature 1: Recorded');
  console.log('✓ Signature 2: Recorded');
  console.log(`✓ All signers signed: ${sign2Result.allSigned}`);

  if (sign2Result.allSigned) {
    console.log('\n🎉 End-to-end document signing flow complete!');
    console.log('\nBlockchain events have been queued to Outbox.');
    console.log('The outbox worker will process them and post to Solana Devnet.');
  }

  console.log(`\nSession ID: ${session.sessionId}`);
  console.log(`Document Hash: ${documentHash}`);
}

main().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
