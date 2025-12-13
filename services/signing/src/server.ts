import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { prisma } from './adapters/prisma.js';
import { ensureIdempotent } from './routes/util-idem.js';
import { constantTimeCompare, isValidTokenFormat, generateSecureToken, hashSHA256 } from './utils/security.js';
import { startOutboxWorker } from './workers/outboxWorker.js';
import { getKeypairManager } from './services/keypairManager.js';
import { createDocumentStorageService } from './services/documentStorage.js';
import { getEmailService } from './services/emailService.js';
import { getSmsService } from './services/smsService.js';
import { generateCertificate } from './services/certificateGenerator.js';

const app = Fastify({ logger: true });

// CORS: Restrict to allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
].filter(Boolean);

await app.register(fastifyCors as any, {
  origin: (origin: string, cb: (err: Error | null, allow: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true,
});

// Rate limiting: Global default
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'rate_limit_exceeded',
    message: 'Too many requests, please try again later',
  }),
});

// Start outbox worker for blockchain processing
startOutboxWorker().then(() => {
  app.log.info('Outbox worker started');
}).catch((err) => {
  app.log.error({ err }, 'Failed to start outbox worker');
});

app.get('/health', async () => ({ ok: true, service: 'signing' }));

/**
 * POST /sessions - Create a new signing session
 *
 * This endpoint:
 * 1. Creates a Document record
 * 2. Creates a SigningSession
 * 3. Creates Signer records with tokens
 * 4. Queues blockchain.create_document event to Outbox
 */
const CreateSessionSchema = z.object({
  documentName: z.string().min(1),
  documentHash: z.string().length(64), // SHA-256 hex
  documentUrl: z.string().url(), // URL where document is hosted (Google Drive, Dropbox, etc.)
  documentMimeType: z.string().default('application/pdf'),
  documentSize: z.number().positive(),
  creatorId: z.string().min(1),
  userId: z.string().optional(), // Optional: authenticated user ID from NextAuth
  expiresAt: z.string().datetime().optional(), // Optional: session deadline (ISO 8601)
  sequentialSigning: z.boolean().optional().default(false), // Enforce signing order
  signers: z.array(z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(), // Phone number for SMS magic links
    did: z.string().optional(),
    orderIndex: z.number().int().min(0).optional(),
  })).min(1).refine(
    // At least one contact method (email or phone) required per signer
    (signers) => signers.every(s => s.email || s.phone),
    { message: 'Each signer must have either an email or phone number' }
  ),
});

app.post('/sessions', async (req, reply) => {
  const body = CreateSessionSchema.parse(req.body);
  const idemKey = req.headers['idempotency-key'] as string;

  if (idemKey) {
    await ensureIdempotent(idemKey);
  }

  const keypairManager = getKeypairManager();

  // Create or get keypair for creator - use original DID for lookup
  const creatorOriginalDID = body.creatorId.startsWith('did:') ? body.creatorId : `did:sol:${body.creatorId}`;
  const creatorKeypair = await keypairManager.getOrCreateKeypairForDID(creatorOriginalDID);
  // Use the original DID for blockchain lookups (not the public key based one)
  const creatorDID = creatorOriginalDID;

  // Process signers - create keypairs and DIDs for each
  const signerDIDs: string[] = [];
  const signerData = await Promise.all(
    body.signers.map(async (signer, index) => {
      let signerDID = signer.did;

      if (!signerDID) {
        // Generate a unique DID for this signer based on email/phone or random
        const identifier = signer.email || signer.phone || `signer-${Date.now()}-${index}`;
        signerDID = `did:sol:pending:${hashSHA256(identifier).substring(0, 16)}`;
        // Create keypair for this DID
        await keypairManager.getOrCreateKeypairForDID(signerDID);
      }

      // Use the original DID (not derived from public key)
      signerDIDs.push(signerDID);

      return {
        email: signer.email,
        phone: signer.phone,
        did: signerDID,
        orderIndex: signer.orderIndex ?? index,
        status: 'pending',
      };
    })
  );

  // Create everything in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Document
    const document = await tx.document.create({
      data: {
        ownerId: body.creatorId,
        name: body.documentName,
        mimeType: body.documentMimeType,
        sizeBytes: body.documentSize,
        hashSha256: body.documentHash,
        storageRef: body.documentUrl, // URL where document is hosted externally
      },
    });

    // 2. Create SigningSession
    const session = await tx.signingSession.create({
      data: {
        documentId: document.id,
        creatorId: body.creatorId,
        userId: body.userId, // Link to authenticated user if provided
        status: 'pending',
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null, // Optional deadline
        sequentialSigning: body.sequentialSigning, // Enforce signing order
      },
    });

    // 3. Create Signers with tokens
    const signersWithTokens = await Promise.all(
      signerData.map(async (data) => {
        const signer = await tx.signer.create({
          data: {
            sessionId: session.id,
            email: data.email,
            phone: data.phone,
            did: data.did,
            orderIndex: data.orderIndex,
            status: data.status,
          },
        });

        // Generate secure token for this signer
        const token = generateSecureToken();
        const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        // Token expiration = min(7 days, session deadline)
        const sessionExpiry = body.expiresAt ? new Date(body.expiresAt) : null;
        const expiresAt = sessionExpiry && sessionExpiry < defaultExpiry ? sessionExpiry : defaultExpiry;

        await tx.signerToken.create({
          data: {
            token,
            sessionId: session.id,
            signerId: signer.id,
            expiresAt,
          },
        });

        return { signer, token };
      })
    );

    // 4. Create audit event
    await tx.auditEvent.create({
      data: {
        sessionId: session.id,
        type: 'session.created',
        actor: body.creatorId,
        payload: {
          documentName: body.documentName,
          signerCount: signerData.length,
        },
      },
    });

    // 5. Queue blockchain.create_document event
    await tx.outbox.create({
      data: {
        type: 'blockchain.create_document',
        payload: {
          sessionId: session.id,
          documentHash: body.documentHash,
          signerDIDs: signerDIDs,
          creatorDID: creatorDID,
        },
        dedupeKey: `create_doc:${session.id}`,
      },
    });

    return { document, session, signersWithTokens };
  });

  app.log.info({ sessionId: result.session.id }, 'Session created and queued for blockchain');

  // Send signing invitation via SMS (preferred) or email (fallback)
  const smsService = getSmsService();
  const emailService = getEmailService();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  for (const { signer, token } of result.signersWithTokens) {
    const signingUrl = `${frontendUrl}/sign/${token}`;

    // Prefer SMS if phone is provided
    if (signer.phone) {
      smsService.sendSigningLink({
        to: signer.phone,
        documentName: body.documentName,
        signingUrl,
      }).catch((err) => {
        app.log.error({ err, phone: signer.phone }, 'Failed to send signing invite SMS');
      });
    } else if (signer.email) {
      // Fallback to email if no phone
      emailService.sendSigningInvite({
        to: signer.email,
        documentName: body.documentName,
        signingUrl,
      }).catch((err) => {
        app.log.error({ err, email: signer.email }, 'Failed to send signing invite email');
      });
    }
  }

  return reply.code(201).send({
    sessionId: result.session.id,
    documentId: result.document.id,
    status: 'pending',
    signers: result.signersWithTokens.map(({ signer, token }) => ({
      id: signer.id,
      email: signer.email,
      phone: signer.phone,
      did: signer.did,
      token, // Include token in response for sending to signers
      signingUrl: `${frontendUrl}/sign/${token}`,
    })),
    message: 'Session created. Document will be registered on blockchain shortly.',
  });
});

/*app.get('/public/session-by-token', async (req, reply) => {
  const token = (req.query as any).token as string;
  const tok = await prisma.signerToken.findUnique({ where: { token } });
  if (!tok || tok.usedAt || tok.expiresAt < new Date()) return reply.code(401).send({ error: 'expired' });

  const session = await prisma.signingSession.findUnique({ where: { id: tok.sessionId }, include: { signers: true } });
  if (!session) return reply.code(404).send({ error: 'notfound' });

  // For MVP, hardcode a sample storageRef
  return reply.send({
    id: session.id,
    status: session.status,
    document: { name: 'Demo.pdf', storageRef: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf', mimeType: 'application/pdf' },
    signers: session.signers.map(s => ({ id: s.id, email: s.email, did: s.did, status: s.status }))
  });
}); */

app.get('/public/session-by-token', async (req, reply) => {
  const token = (req.query as any).token as string | undefined;
  const ua = (req.headers['user-agent'] as string) || '';
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';

  app.log.info({ path: 'session-by-token', ip, ua }, 'incoming');

  if (!token) return reply.code(401).send({ error: 'missing_token' });

  // Validate token format before database query (prevent injection)
  if (!isValidTokenFormat(token)) {
    app.log.warn({ ip, ua }, 'invalid_token_format');
    return reply.code(401).send({ error: 'invalid_token_format' });
  }

  const tok = await prisma.signerToken.findUnique({ where: { token } });
  if (!tok) {
    app.log.warn({ ip, ua }, 'token_not_found');
    return reply.code(404).send({ error: 'token_not_found' });
  }

  if (tok.expiresAt < new Date()) return reply.code(401).send({ error: 'expired' });
  if (tok.usedAt) return reply.code(401).send({ error: 'already_used' });

  // Check if token has been invalidated (cancelled or resent)
  if (tok.invalidatedAt) {
    app.log.warn({ ip, ua, invalidatedBy: tok.invalidatedBy }, 'token_invalidated');
    return reply.code(401).send({ error: 'token_invalidated', reason: tok.invalidatedBy });
  }

  // SECURITY: Enforce IP/UA binding - reject on mismatch
  if (tok.boundIp || tok.boundUa) {
    // Token already bound - validate match
    const ipMatch = !tok.boundIp || constantTimeCompare(tok.boundIp, ip);
    const uaMatch = !tok.boundUa || constantTimeCompare(tok.boundUa, ua);

    if (!ipMatch || !uaMatch) {
      app.log.warn({ ip, ua, boundIp: tok.boundIp, boundUa: tok.boundUa }, 'binding_mismatch');
      return reply.code(403).send({ error: 'binding_mismatch' });
    }
  } else {
    // First access - bind the token
    await prisma.signerToken.update({ where: { token }, data: { boundIp: ip, boundUa: ua } });
  }

  const session = await prisma.signingSession.findUnique({
    where: { id: tok.sessionId },
    include: { signers: true, document: true }
  });
  if (!session) return reply.code(404).send({ error: 'session_not_found' });

  // Check session status for cancelled/expired
  if (session.status === 'cancelled') {
    return reply.code(410).send({ error: 'session_cancelled' });
  }

  if (session.status === 'expired') {
    return reply.code(410).send({ error: 'session_expired' });
  }

  // Check session deadline and auto-expire if past
  if (session.expiresAt && session.expiresAt < new Date()) {
    // Auto-expire the session
    await prisma.signingSession.update({
      where: { id: session.id },
      data: { status: 'expired' },
    });
    return reply.code(410).send({ error: 'session_expired' });
  }

  // Build document URL - use storageRef if it's a URL, otherwise build internal URL
  const doc = session.document;
  let documentUrl: string;
  if (doc.storageRef.startsWith('http://') || doc.storageRef.startsWith('https://')) {
    documentUrl = doc.storageRef;
  } else if (doc.storageRef.startsWith('mock://')) {
    // Mock storage - use demo PDF for now
    documentUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
  } else {
    // S3 storage - build internal document URL
    documentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/documents/${doc.id}`;
  }

  // Get current signer's position and check if they can sign (for sequential signing)
  const currentSigner = session.signers.find(s => s.id === tok.signerId);
  let canSign = true;
  let waitingMessage: string | null = null;

  if (session.sequentialSigning && currentSigner) {
    const sortedSigners = [...session.signers].sort((a, b) => a.orderIndex - b.orderIndex);
    const previousSigners = sortedSigners.filter(s => s.orderIndex < currentSigner.orderIndex);
    const allPreviousSigned = previousSigners.every(s => s.status === 'signed');

    if (!allPreviousSigned) {
      canSign = false;
      const nextPending = sortedSigners.find(s => s.status === 'pending' && s.orderIndex < currentSigner.orderIndex);
      const nextPosition = nextPending ? nextPending.orderIndex + 1 : 1;
      waitingMessage = `Waiting for signer #${nextPosition} to complete before you can sign`;
    }
  }

  return reply.send({
    id: session.id,
    status: session.status,
    document: {
      id: doc.id,
      name: doc.name,
      url: documentUrl,
      mimeType: doc.mimeType,
      hash: doc.hashSha256, // SHA-256 hash for verification
    },
    signers: session.signers.map(s => ({
      id: s.id,
      email: s.email,
      status: s.status,
      orderIndex: s.orderIndex,
    })),
    sequentialSigning: session.sequentialSigning,
    currentSignerPosition: currentSigner ? currentSigner.orderIndex + 1 : null,
    canSign,
    waitingMessage,
  });
});

app.post('/public/sign', async (req, reply) => {
  const body = z.object({
    sessionId: z.string(),
    signerToken: z.string(),
    signaturePayload: z.object({ imageDataUrl: z.string().startsWith('data:image/') })
  }).parse(req.body);

  const ua = (req.headers['user-agent'] as string) || '';
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';

  // Validate token format
  if (!isValidTokenFormat(body.signerToken)) {
    app.log.warn({ ip, ua }, 'invalid_token_format_on_sign');
    return reply.code(401).send({ error: 'invalid_token_format' });
  }

  const idem = (req.headers['idempotency-key'] as string) || `${body.signerToken}:${body.sessionId}`;
  await ensureIdempotent(idem);

  const tok = await prisma.signerToken.findUnique({ where: { token: body.signerToken } });
  if (!tok || !constantTimeCompare(tok.sessionId, body.sessionId) || tok.usedAt || tok.expiresAt < new Date()) {
    return reply.code(401).send({ error: 'invalid-token' });
  }

  // SECURITY: Enforce IP/UA binding
  if (tok.boundIp && !constantTimeCompare(tok.boundIp, ip)) {
    app.log.warn({ ip, boundIp: tok.boundIp }, 'ip_binding_mismatch_on_sign');
    return reply.code(403).send({ error: 'binding_mismatch' });
  }
  if (tok.boundUa && !constantTimeCompare(tok.boundUa, ua)) {
    app.log.warn({ ua, boundUa: tok.boundUa }, 'ua_binding_mismatch_on_sign');
    return reply.code(403).send({ error: 'binding_mismatch' });
  }

  const signer = await prisma.signer.findFirst({ where: { sessionId: body.sessionId, id: tok.signerId } });
  if (!signer) return reply.code(404).send({ error: 'signer-notfound' });

  // Get session to check chain record (document account pubkey)
  const session = await prisma.signingSession.findUnique({
    where: { id: body.sessionId },
    include: { signers: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!session) return reply.code(404).send({ error: 'session-notfound' });

  // SEQUENTIAL SIGNING: Check if previous signers have signed
  if (session.sequentialSigning) {
    const currentSignerIndex = signer.orderIndex;
    const previousSigners = session.signers.filter(s => s.orderIndex < currentSignerIndex);
    const allPreviousSigned = previousSigners.every(s => s.status === 'signed');

    if (!allPreviousSigned) {
      // Find the next signer who needs to sign
      const nextPendingSigner = session.signers.find(s => s.status === 'pending' && s.orderIndex < currentSignerIndex);

      // Create audit event for blocked signing attempt
      await prisma.auditEvent.create({
        data: {
          sessionId: body.sessionId,
          type: 'signer.order_blocked',
          actor: signer.id,
          ip,
          userAgent: ua,
          payload: {
            blockedSignerIndex: currentSignerIndex,
            waitingFor: nextPendingSigner?.orderIndex ?? 0,
          },
        },
      });

      app.log.info({ sessionId: body.sessionId, signerId: signer.id }, 'Sequential signing: waiting for previous signer');

      return reply.code(403).send({
        error: 'sequential_signing_order',
        message: 'Please wait for previous signer(s) to complete before signing',
        currentPosition: currentSignerIndex + 1,
        waitingForPosition: (nextPendingSigner?.orderIndex ?? 0) + 1,
      });
    }
  }

  // Create a deterministic 64-byte signature from the image data
  // In production, this would be a proper cryptographic signature
  const signatureHash = hashSHA256(body.signaturePayload.imageDataUrl);
  const signatureData = signatureHash + signatureHash; // 64 bytes (128 hex chars)

  await prisma.$transaction([
    prisma.signer.update({
      where: { id: signer.id },
      data: {
        status: 'signed',
        signedAt: new Date(),
        signatureImage: body.signaturePayload.imageDataUrl, // Store signature image for certificate
        signatureHash: signatureHash,
      }
    }),
    prisma.auditEvent.create({
      data: {
        sessionId: body.sessionId,
        type: 'signer.signed',
        actor: signer.id,
        ip,
        userAgent: ua,
        payload: { signatureHash: signatureHash.substring(0, 16) },
      }
    }),
    prisma.signerToken.update({ where: { token: body.signerToken }, data: { usedAt: new Date() } }),
    // Always queue blockchain signature event - worker will look up chainRecord at processing time
    prisma.outbox.create({
      data: {
        type: 'blockchain.add_signature',
        payload: {
          sessionId: body.sessionId,
          signerDID: signer.did,
          signatureData: signatureData,
        },
        dedupeKey: `sign:${body.sessionId}:${signer.id}`,
      },
    }),
  ]);

  // Check if all signers have signed
  const updatedSession = await prisma.signingSession.findUnique({
    where: { id: body.sessionId },
    include: { signers: true },
  });

  const allSigned = updatedSession?.signers.every(s => s.status === 'signed');

  if (allSigned && updatedSession) {
    // Update session status and queue finalize event
    await prisma.$transaction([
      prisma.signingSession.update({
        where: { id: body.sessionId },
        data: { status: 'completed' },
      }),
      prisma.auditEvent.create({
        data: {
          sessionId: body.sessionId,
          type: 'session.completed',
          actor: 'system',
        },
      }),
      // Always queue finalize event - worker will look up chainRecord at processing time
      prisma.outbox.create({
        data: {
          type: 'blockchain.finalize_document',
          payload: {
            sessionId: body.sessionId,
          },
          dedupeKey: `finalize:${body.sessionId}`,
        },
      }),
    ]);

    app.log.info({ sessionId: body.sessionId }, 'All signers have signed - session completed');

    // Send completion notifications via SMS or email (async, non-blocking)
    const smsService = getSmsService();
    const emailService = getEmailService();
    const sessionWithDoc = await prisma.signingSession.findUnique({
      where: { id: body.sessionId },
      include: { document: true, signers: true },
    });

    if (sessionWithDoc) {
      for (const s of sessionWithDoc.signers) {
        // Prefer SMS if phone is available
        if (s.phone) {
          smsService.sendSigningComplete({
            to: s.phone,
            documentName: sessionWithDoc.document.name,
          }).catch((err) => {
            app.log.error({ err, phone: s.phone }, 'Failed to send signing complete SMS');
          });
        } else if (s.email) {
          emailService.sendSigningComplete({
            to: s.email,
            documentName: sessionWithDoc.document.name,
          }).catch((err) => {
            app.log.error({ err, email: s.email }, 'Failed to send signing complete email');
          });
        }
      }
    }
  }

  return reply.send({ ok: true, allSigned: allSigned || false });
});

/**
 * POST /sessions/finalize - Manually finalize a session (admin use)
 * Requires authentication
 */
app.post('/sessions/finalize', async (req, reply) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const { sessionId } = z.object({ sessionId: z.string() }).parse(req.body);

  // Verify user owns the session
  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  await prisma.outbox.create({
    data: {
      type: 'chain.post',
      payload: { sessionId } as any,
      dedupeKey: `chain:${sessionId}`,
    },
  });
  await prisma.signingSession.update({
    where: { id: sessionId },
    data: { status: 'completed' },
  });

  return reply.send({ status: 'pending_chain' });
});

/**
 * GET /public/documents/:documentId - Serve document from S3 storage
 * Requires valid session access (token must have been validated)
 */
app.get('/public/documents/:documentId', async (req, reply) => {
  const { documentId } = req.params as { documentId: string };

  try {
    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return reply.code(404).send({ error: 'document_not_found' });
    }

    // Parse storage ref - format: s3://bucket/key or just the key
    const storageRef = document.storageRef;

    // For mock storage, return demo PDF redirect
    if (storageRef.startsWith('mock://')) {
      return reply.redirect('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
    }

    // For http URLs, redirect directly
    if (storageRef.startsWith('http://') || storageRef.startsWith('https://')) {
      return reply.redirect(storageRef);
    }

    // For S3 storage, fetch from S3
    const documentStorage = createDocumentStorageService();

    // Extract document ID and filename from storageRef
    // Format: documents/{documentId}/{filename}
    const parts = storageRef.split('/');
    if (parts.length < 3 || parts[0] !== 'documents') {
      app.log.error({ storageRef }, 'Invalid storage ref format');
      return reply.code(500).send({ error: 'invalid_storage_ref' });
    }

    const s3DocId = parts[1];
    const filename = parts.slice(2).join('/');

    const result = await documentStorage.downloadDocument(s3DocId, filename);

    return reply
      .header('Content-Type', result.mimeType)
      .header('Content-Disposition', `inline; filename="${result.filename}"`)
      .send(result.content);
  } catch (error) {
    app.log.error({ error, documentId }, 'Failed to serve document');
    return reply.code(500).send({ error: 'document_fetch_failed' });
  }
});

/**
 * GET /sessions/:sessionId/certificate - Download signing certificate PDF
 *
 * Generates and returns a PDF certificate with:
 * - Document info and hash
 * - All signatures with images
 * - Blockchain record
 * - QR code for verification
 */
app.get('/sessions/:sessionId/certificate', async (req, reply) => {
  const { sessionId } = req.params as { sessionId: string };
  const userId = req.headers['x-user-id'] as string;

  // Allow both authenticated users and signers with valid tokens
  const signerToken = (req.query as any).token as string | undefined;

  try {
    // Check if session exists and is completed
    const session = await prisma.signingSession.findUnique({
      where: { id: sessionId },
      include: { document: true, signers: true },
    });

    if (!session) {
      return reply.code(404).send({ error: 'session_not_found' });
    }

    // Authorization: Must be creator, owner, or a signer
    const isCreator = userId && (session.userId === userId || session.creatorId === userId);
    let isSigner = false;

    // Check if request has a valid signer token for this session
    if (signerToken && isValidTokenFormat(signerToken)) {
      const token = await prisma.signerToken.findUnique({ where: { token: signerToken } });
      if (token && token.sessionId === sessionId) {
        isSigner = true;
      }
    }

    if (!isCreator && !isSigner) {
      return reply.code(403).send({ error: 'forbidden', message: 'You do not have access to this certificate' });
    }

    if (session.status !== 'completed') {
      return reply.code(400).send({
        error: 'session_not_completed',
        message: 'Certificate is only available for completed signing sessions',
      });
    }

    // Generate certificate PDF
    const pdfBytes = await generateCertificate(sessionId);

    if (!pdfBytes) {
      return reply.code(500).send({ error: 'certificate_generation_failed' });
    }

    // Generate filename
    const safeName = session.document.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `SignaTrust_Certificate_${safeName}.pdf`;

    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .header('Content-Length', pdfBytes.length)
      .send(Buffer.from(pdfBytes));
  } catch (error) {
    app.log.error({ error, sessionId }, 'Failed to generate certificate');
    return reply.code(500).send({ error: 'certificate_generation_failed' });
  }
});

/**
 * POST /sessions/:sessionId/cancel - Cancel a pending signing session
 *
 * - Only pending sessions can be cancelled
 * - Only session creator can cancel
 * - Invalidates all pending signer tokens
 * - Queues blockchain cancellation event
 * - Sends cancellation notifications to signers
 */
const CancelSessionSchema = z.object({
  reason: z.string().max(500).optional(),
});

app.post('/sessions/:sessionId/cancel', async (req, reply) => {
  const { sessionId } = req.params as { sessionId: string };
  const body = CancelSessionSchema.parse(req.body || {});

  // Get authenticated user from header (set by API proxy)
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
  const ua = (req.headers['user-agent'] as string) || '';

  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
    include: { signers: true, document: true },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  // Authorization: only creator can cancel
  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  // Validation: only pending sessions can be cancelled
  if (session.status !== 'pending') {
    return reply.code(400).send({
      error: 'invalid_status',
      message: 'Only pending sessions can be cancelled',
    });
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update session status
    await tx.signingSession.update({
      where: { id: sessionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledReason: body.reason || null,
      },
    });

    // 2. Invalidate all pending signer tokens
    await tx.signerToken.updateMany({
      where: {
        sessionId,
        usedAt: null,
        invalidatedAt: null,
      },
      data: {
        invalidatedAt: new Date(),
        invalidatedBy: 'cancel',
      },
    });

    // 3. Create audit event
    await tx.auditEvent.create({
      data: {
        sessionId,
        type: 'session.cancelled',
        actor: userId,
        ip,
        userAgent: ua,
        payload: { reason: body.reason || null },
      },
    });

    // 4. Queue blockchain cancellation event (only if chainRecord exists)
    if (session.chainRecord) {
      await tx.outbox.create({
        data: {
          type: 'blockchain.cancel_document',
          payload: {
            sessionId,
            creatorDID: session.creatorId,
          },
          dedupeKey: `cancel:${sessionId}`,
        },
      });
    }
  });

  // 5. Send cancellation notifications (async, non-blocking)
  const smsService = getSmsService();
  const emailService = getEmailService();

  for (const signer of session.signers) {
    if (signer.status === 'pending') {
      if (signer.phone) {
        smsService.sendSessionCancelled({
          to: signer.phone,
          documentName: session.document.name,
        }).catch((err) => {
          app.log.error({ err }, 'Failed to send cancel SMS');
        });
      } else if (signer.email) {
        emailService.sendSessionCancelled({
          to: signer.email,
          documentName: session.document.name,
        }).catch((err) => {
          app.log.error({ err }, 'Failed to send cancel email');
        });
      }
    }
  }

  app.log.info({ sessionId }, 'Session cancelled');

  return reply.send({
    ok: true,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
  });
});

/**
 * PATCH /sessions/:sessionId - Update session (deadline)
 *
 * - Only pending sessions can be updated
 * - Only session creator can update
 * - Deadline must be in the future
 */
const UpdateSessionSchema = z.object({
  expiresAt: z.string().datetime().nullable().optional(),
});

app.patch('/sessions/:sessionId', async (req, reply) => {
  const { sessionId } = req.params as { sessionId: string };
  const body = UpdateSessionSchema.parse(req.body);
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  if (session.status !== 'pending') {
    return reply.code(400).send({ error: 'cannot_update_non_pending_session' });
  }

  // Validate deadline is in the future
  if (body.expiresAt) {
    const newExpiry = new Date(body.expiresAt);
    if (newExpiry <= new Date()) {
      return reply.code(400).send({ error: 'deadline_must_be_future' });
    }
  }

  const updated = await prisma.signingSession.update({
    where: { id: sessionId },
    data: {
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  // Create audit event
  await prisma.auditEvent.create({
    data: {
      sessionId,
      type: 'session.deadline_updated',
      actor: userId,
      payload: { expiresAt: body.expiresAt },
    },
  });

  app.log.info({ sessionId, expiresAt: body.expiresAt }, 'Session deadline updated');

  return reply.send({ ok: true, expiresAt: updated.expiresAt });
});

/**
 * POST /sessions/:sessionId/signers/:signerId/resend - Resend invite to a signer
 *
 * - Only pending signers can receive resends
 * - Rate limited: max 5 resends per signer, min 5 min between
 * - Invalidates old token and creates new one
 */
const MAX_RESENDS_PER_SIGNER = 5;
const MIN_RESEND_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

app.post('/sessions/:sessionId/signers/:signerId/resend', async (req, reply) => {
  const { sessionId, signerId } = req.params as { sessionId: string; signerId: string };
  const userId = req.headers['x-user-id'] as string;
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
  const ua = (req.headers['user-agent'] as string) || '';

  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
    include: { document: true, signers: true },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  if (session.status !== 'pending') {
    return reply.code(400).send({ error: 'session_not_pending' });
  }

  // Check if session is expired
  if (session.expiresAt && session.expiresAt < new Date()) {
    return reply.code(400).send({ error: 'session_expired' });
  }

  const signer = session.signers.find((s) => s.id === signerId);
  if (!signer) {
    return reply.code(404).send({ error: 'signer_not_found' });
  }

  if (signer.status === 'signed') {
    return reply.code(400).send({ error: 'signer_already_signed' });
  }

  // Rate limiting checks
  if (signer.resendCount >= MAX_RESENDS_PER_SIGNER) {
    return reply.code(429).send({
      error: 'max_resends_exceeded',
      message: `Maximum ${MAX_RESENDS_PER_SIGNER} resends per signer`,
    });
  }

  if (signer.lastResendAt) {
    const timeSinceLastResend = Date.now() - signer.lastResendAt.getTime();
    if (timeSinceLastResend < MIN_RESEND_INTERVAL_MS) {
      const waitSeconds = Math.ceil((MIN_RESEND_INTERVAL_MS - timeSinceLastResend) / 1000);
      return reply.code(429).send({
        error: 'resend_too_soon',
        retryAfter: waitSeconds,
      });
    }
  }

  // Generate new token
  const newToken = generateSecureToken();

  // Calculate expiration (respect session deadline)
  const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiresAt =
    session.expiresAt && session.expiresAt < defaultExpiry
      ? session.expiresAt
      : defaultExpiry;

  await prisma.$transaction(async (tx) => {
    // 1. Invalidate old tokens
    await tx.signerToken.updateMany({
      where: {
        signerId,
        usedAt: null,
        invalidatedAt: null,
      },
      data: {
        invalidatedAt: new Date(),
        invalidatedBy: 'resend',
      },
    });

    // 2. Create new token
    await tx.signerToken.create({
      data: {
        token: newToken,
        sessionId,
        signerId,
        expiresAt,
      },
    });

    // 3. Update signer resend tracking
    await tx.signer.update({
      where: { id: signerId },
      data: {
        resendCount: { increment: 1 },
        lastResendAt: new Date(),
      },
    });

    // 4. Create audit event
    await tx.auditEvent.create({
      data: {
        sessionId,
        type: 'signer.invite_resent',
        actor: userId,
        ip,
        userAgent: ua,
        payload: { signerId, resendCount: signer.resendCount + 1 },
      },
    });
  });

  // 5. Send new invite
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const signingUrl = `${frontendUrl}/sign/${newToken}`;
  const smsService = getSmsService();
  const emailService = getEmailService();

  if (signer.phone) {
    await smsService.sendSigningLink({
      to: signer.phone,
      documentName: session.document.name,
      signingUrl,
    }).catch((err) => {
      app.log.error({ err }, 'Failed to send resend SMS');
    });
  } else if (signer.email) {
    await emailService.sendSigningInvite({
      to: signer.email,
      documentName: session.document.name,
      signingUrl,
    }).catch((err) => {
      app.log.error({ err }, 'Failed to send resend email');
    });
  }

  app.log.info({ sessionId, signerId, resendCount: signer.resendCount + 1 }, 'Invite resent');

  return reply.send({
    ok: true,
    signerId,
    resendCount: signer.resendCount + 1,
    maxResends: MAX_RESENDS_PER_SIGNER,
  });
});

/**
 * POST /sessions/:sessionId/resend-all - Resend invites to all pending signers
 */
app.post('/sessions/:sessionId/resend-all', async (req, reply) => {
  const { sessionId } = req.params as { sessionId: string };
  const userId = req.headers['x-user-id'] as string;
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
  const ua = (req.headers['user-agent'] as string) || '';

  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
    include: { document: true, signers: true },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  if (session.status !== 'pending') {
    return reply.code(400).send({ error: 'session_not_pending' });
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    return reply.code(400).send({ error: 'session_expired' });
  }

  const pendingSigners = session.signers.filter((s) => s.status === 'pending');
  const results: Array<{ signerId: string; success: boolean; error?: string }> = [];

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const smsService = getSmsService();
  const emailService = getEmailService();

  for (const signer of pendingSigners) {
    // Skip if at max resends
    if (signer.resendCount >= MAX_RESENDS_PER_SIGNER) {
      results.push({ signerId: signer.id, success: false, error: 'max_resends_exceeded' });
      continue;
    }

    // Skip if too soon
    if (signer.lastResendAt && Date.now() - signer.lastResendAt.getTime() < MIN_RESEND_INTERVAL_MS) {
      results.push({ signerId: signer.id, success: false, error: 'resend_too_soon' });
      continue;
    }

    try {
      const newToken = generateSecureToken();
      const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiresAt =
        session.expiresAt && session.expiresAt < defaultExpiry
          ? session.expiresAt
          : defaultExpiry;

      await prisma.$transaction(async (tx) => {
        await tx.signerToken.updateMany({
          where: { signerId: signer.id, usedAt: null, invalidatedAt: null },
          data: { invalidatedAt: new Date(), invalidatedBy: 'resend' },
        });

        await tx.signerToken.create({
          data: { token: newToken, sessionId, signerId: signer.id, expiresAt },
        });

        await tx.signer.update({
          where: { id: signer.id },
          data: { resendCount: { increment: 1 }, lastResendAt: new Date() },
        });

        await tx.auditEvent.create({
          data: {
            sessionId,
            type: 'signer.invite_resent',
            actor: userId,
            ip,
            userAgent: ua,
            payload: { signerId: signer.id, resendCount: signer.resendCount + 1, bulk: true },
          },
        });
      });

      const signingUrl = `${frontendUrl}/sign/${newToken}`;
      if (signer.phone) {
        await smsService.sendSigningLink({
          to: signer.phone,
          documentName: session.document.name,
          signingUrl,
        });
      } else if (signer.email) {
        await emailService.sendSigningInvite({
          to: signer.email,
          documentName: session.document.name,
          signingUrl,
        });
      }

      results.push({ signerId: signer.id, success: true });
    } catch (err) {
      app.log.error({ err, signerId: signer.id }, 'Failed to resend invite');
      results.push({ signerId: signer.id, success: false, error: 'send_failed' });
    }
  }

  app.log.info({ sessionId, results }, 'Bulk resend completed');

  return reply.send({ ok: true, results });
});

/**
 * GET /sessions/:sessionId/audit-log - Get session audit log
 *
 * Returns all audit events for a session in chronological order
 * Includes: session creation, signatures, resends, cancellations, etc.
 */
app.get('/sessions/:sessionId/audit-log', async (req, reply) => {
  const { sessionId } = req.params as { sessionId: string };
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
    include: { signers: true },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  // Authorization: only creator can view audit log
  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  // Get all audit events for this session
  const auditEvents = await prisma.auditEvent.findMany({
    where: { sessionId },
    orderBy: { at: 'asc' },
  });

  // Build signer lookup for enriching events
  const signerLookup = new Map(
    session.signers.map((s) => [s.id, { email: s.email, phone: s.phone }])
  );

  // Enrich events with human-readable descriptions
  const enrichedEvents = auditEvents.map((event) => {
    let description = '';
    let actorDisplay = event.actor;

    // Get actor display name
    if (event.actor === 'system') {
      actorDisplay = 'System';
    } else if (signerLookup.has(event.actor)) {
      const signer = signerLookup.get(event.actor)!;
      actorDisplay = signer.email || signer.phone || 'Signer';
    }

    // Generate description based on event type
    switch (event.type) {
      case 'session.created':
        description = `Session created with ${(event.payload as any)?.signerCount || 0} signer(s)`;
        break;
      case 'signer.signed':
        description = `Document signed`;
        break;
      case 'session.completed':
        description = 'All signatures collected - session completed';
        break;
      case 'session.cancelled':
        const reason = (event.payload as any)?.reason;
        description = reason ? `Session cancelled: ${reason}` : 'Session cancelled';
        break;
      case 'session.deadline_updated':
        const expiresAt = (event.payload as any)?.expiresAt;
        description = expiresAt
          ? `Deadline set to ${new Date(expiresAt).toLocaleString()}`
          : 'Deadline removed';
        break;
      case 'signer.invite_resent':
        const resendCount = (event.payload as any)?.resendCount || 0;
        const bulk = (event.payload as any)?.bulk;
        description = bulk
          ? `Invite resent (bulk) - attempt ${resendCount}`
          : `Invite resent - attempt ${resendCount}`;
        break;
      case 'signer.order_skipped':
        description = 'Sequential signing: waiting for previous signer';
        break;
      default:
        description = event.type;
    }

    return {
      id: event.id,
      type: event.type,
      actor: actorDisplay,
      actorId: event.actor,
      description,
      timestamp: event.at.toISOString(),
      ip: event.ip,
      userAgent: event.userAgent,
      payload: event.payload,
    };
  });

  return reply.send({
    sessionId,
    eventCount: enrichedEvents.length,
    events: enrichedEvents,
  });
});

/**
 * GET /sessions - List sessions for authenticated user
 */
app.get('/sessions', async (req, reply) => {
  const userId = req.headers['x-user-id'] as string;
  const { status, limit, offset } = req.query as {
    status?: string;
    limit?: string;
    offset?: string;
  };

  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const where: any = {
    OR: [{ userId }, { creatorId: userId }],
  };

  if (status) {
    where.status = status;
  }

  const sessions = await prisma.signingSession.findMany({
    where,
    include: {
      document: true,
      signers: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit ? parseInt(limit) : 50,
    skip: offset ? parseInt(offset) : 0,
  });

  return reply.send({
    sessions: sessions.map((s) => ({
      id: s.id,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt?.toISOString() || null,
      cancelledAt: s.cancelledAt?.toISOString() || null,
      document: {
        id: s.document.id,
        name: s.document.name,
      },
      signers: s.signers.map((sig) => ({
        id: sig.id,
        email: sig.email,
        phone: sig.phone,
        status: sig.status,
        orderIndex: sig.orderIndex,
        signedAt: sig.signedAt?.toISOString() || null,
      })),
      chainRecord: s.chainRecord,
    })),
  });
});

/**
 * PATCH /sessions/:sessionId/sequential-signing - Enable/disable sequential signing
 */
const SequentialSigningSchema = z.object({
  enabled: z.boolean(),
});

app.patch('/sessions/:sessionId/sequential-signing', async (req, reply) => {
  const { sessionId } = req.params as { sessionId: string };
  const body = SequentialSigningSchema.parse(req.body);
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return reply.code(404).send({ error: 'session_not_found' });
  }

  if (session.userId !== userId && session.creatorId !== userId) {
    return reply.code(403).send({ error: 'forbidden' });
  }

  if (session.status !== 'pending') {
    return reply.code(400).send({ error: 'cannot_update_non_pending_session' });
  }

  // Update sequential signing setting
  await prisma.$transaction([
    prisma.signingSession.update({
      where: { id: sessionId },
      data: {
        sequentialSigning: body.enabled,
      },
    }),
    prisma.auditEvent.create({
      data: {
        sessionId,
        type: 'session.sequential_signing_updated',
        actor: userId,
        payload: { enabled: body.enabled },
      },
    }),
  ]);

  app.log.info({ sessionId, enabled: body.enabled }, 'Sequential signing updated');

  return reply.send({ ok: true, sequentialSigning: body.enabled });
});

app.listen({ port: 4030, host: '0.0.0.0' });
