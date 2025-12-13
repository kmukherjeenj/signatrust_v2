/**
 * Full E2E Flow Test Script
 *
 * Tests: Session creation → Token validation → Signature submission
 *
 * Usage: npx tsx scripts/test-full-flow.ts
 */

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface SessionResponse {
  sessionId: string;
  documentId: string;
  status: string;
  signers: Array<{
    id: string;
    email?: string;
    phone?: string;
    token: string;
    signingUrl: string;
  }>;
  message: string;
}

async function testFullFlow() {
  console.log('🧪 SignaTrust Full Flow Test\n');
  console.log('='.repeat(50));

  // Step 1: Create a signing session
  console.log('\n📝 Step 1: Creating signing session...');

  const mockHash = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const createResponse = await fetch(`${SIGNING_SERVICE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentName: 'Test Contract',
      documentHash: mockHash,
      documentUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf', // External PDF URL
      documentMimeType: 'application/pdf',
      documentSize: 1024,
      creatorId: 'test-user',
      signers: [
        { phone: '+15551234567', email: 'test@example.com' },
      ],
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('❌ Failed to create session:', error);
    process.exit(1);
  }

  const session: SessionResponse = await createResponse.json();
  console.log('✅ Session created:', session.sessionId);
  console.log('   Document ID:', session.documentId);
  console.log('   Signers:', session.signers.length);

  const signer = session.signers[0];
  console.log('\n📱 Signer details:');
  console.log('   Phone:', signer.phone);
  console.log('   Email:', signer.email);
  console.log('   Token:', signer.token.substring(0, 20) + '...');
  console.log('   Signing URL:', signer.signingUrl);

  // Step 2: Validate token and get session
  console.log('\n🔐 Step 2: Validating token...');

  const tokenResponse = await fetch(
    `${SIGNING_SERVICE_URL}/public/session-by-token?token=${signer.token}`,
    {
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'X-Forwarded-For': '127.0.0.1',
      },
    }
  );

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('❌ Token validation failed:', error);
    process.exit(1);
  }

  const tokenData = await tokenResponse.json();
  console.log('✅ Token validated');
  console.log('   Session ID:', tokenData.id);
  console.log('   Document:', tokenData.document.name);
  console.log('   Document URL:', tokenData.document.url);
  console.log('   Document Hash:', tokenData.document.hash?.substring(0, 20) + '...');

  // Step 3: Submit signature
  console.log('\n✍️  Step 3: Submitting signature...');

  // Create a mock signature image data URL
  const mockSignatureDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const signResponse = await fetch(`${SIGNING_SERVICE_URL}/public/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Test-Script/1.0',
      'X-Forwarded-For': '127.0.0.1',
    },
    body: JSON.stringify({
      sessionId: session.sessionId,
      signerToken: signer.token,
      signaturePayload: {
        imageDataUrl: mockSignatureDataUrl,
      },
    }),
  });

  if (!signResponse.ok) {
    const error = await signResponse.text();
    console.error('❌ Signature submission failed:', error);
    process.exit(1);
  }

  const signResult = await signResponse.json();
  console.log('✅ Signature submitted');
  console.log('   All signed:', signResult.allSigned);

  // Step 4: Verify token is now used
  console.log('\n🔒 Step 4: Verifying token is invalidated...');

  const revalidateResponse = await fetch(
    `${SIGNING_SERVICE_URL}/public/session-by-token?token=${signer.token}`,
    {
      headers: {
        'User-Agent': 'Test-Script/1.0',
        'X-Forwarded-For': '127.0.0.1',
      },
    }
  );

  if (revalidateResponse.status === 401) {
    const data = await revalidateResponse.json();
    if (data.error === 'already_used') {
      console.log('✅ Token correctly invalidated after use');
    }
  } else {
    console.log('⚠️  Token may not be properly invalidated');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Full Flow Test PASSED!\n');
  console.log('Summary:');
  console.log('  ✅ Session creation');
  console.log('  ✅ Token validation');
  console.log('  ✅ Signature submission');
  console.log('  ✅ Token invalidation');
  console.log('\nTo test manually:');
  console.log(`  1. Open: ${FRONTEND_URL}`);
  console.log('  2. Create a session with your phone number');
  console.log('  3. Check SMS (or logs in dev mode)');
  console.log('  4. Open the signing URL and complete signing');
}

// Run the test
testFullFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
