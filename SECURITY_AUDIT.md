# SignaTrust Security Audit Report

**Date:** December 13, 2025
**Scope:** Full application security review
**Status:** Critical and High severity issues FIXED

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 2 | ✅ FIXED |
| High | 4 | ✅ FIXED |
| Medium | 4 | Fix recommended |
| Low | 2 | Consider fixing |

### Fixes Applied (December 13, 2025)
- ✅ Next.js updated to 16.0.10 (fixed RCE vulnerability)
- ✅ `/sessions/finalize` endpoint now requires authentication
- ✅ `/sessions/:id/certificate` endpoint now requires authorization
- ✅ CORS restricted to allowed origins only
- ✅ Rate limiting added (100 req/min global)
- ✅ PDF proxy SSRF fixed with host allowlist and IP blocking

---

## Critical Findings

### 1. [CRITICAL] ✅ FIXED - Next.js Remote Code Execution Vulnerability

**Location:** `apps/web-frontend/package.json`
**Previous Version:** Next.js 15.5.6
**Current Version:** Next.js 16.0.10
**Status:** FIXED

**Description:**
Next.js versions 15.5.0-15.5.6 are vulnerable to RCE via the React flight protocol. An attacker can execute arbitrary code on the server.

**Fix:**
```bash
cd apps/web-frontend
pnpm update next@15.5.8
```

**Advisory:** https://github.com/advisories/GHSA-9qr9-h5gf-34mp

---

### 2. [CRITICAL] ✅ FIXED - Unauthenticated Session Finalize Endpoint

**Location:** `services/signing/src/server.ts:598-632`
**Status:** FIXED - Now requires `x-user-id` header and verifies session ownership

**Previously Vulnerable Code:**
```typescript
app.post('/sessions/finalize', async (req, reply) => {
  const { sessionId } = (req.body as any);  // No authentication!
  await prisma.outbox.create({ ... });
  await prisma.signingSession.update({ ... });
  return reply.send({ status: 'pending_chain' });
});
```

**Description:**
Anyone can finalize any session without authentication. This allows attackers to mark sessions as complete without valid signatures.

**Fix:**
```typescript
app.post('/sessions/finalize', async (req, reply) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return reply.code(401).send({ error: 'unauthorized' });
  }
  // Verify user owns session before proceeding
  ...
});
```

---

## High Severity Findings

### 3. [HIGH] ✅ FIXED - CORS Allows All Origins

**Location:** `services/signing/src/server.ts:18-32`
**Status:** FIXED - Now uses allowlist based on FRONTEND_URL

**Previously Vulnerable Code:**
```typescript
await app.register(fastifyCors as any, { origin: true });
```

**Description:**
Setting `origin: true` allows requests from any origin. Attackers can make cross-origin requests to the API from malicious sites.

**Applied Fix:**
```typescript
await app.register(fastifyCors, {
  origin: [
    'https://signatrust.io',
    'https://www.signatrust.io',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
});
```

---

### 4. [HIGH] ✅ FIXED - PDF Proxy Server-Side Request Forgery (SSRF)

**Location:** `apps/web-frontend/app/api/proxy-pdf/route.ts`
**Status:** FIXED - Added host allowlist, IP blocking, HTTPS enforcement, size limits

**Previously Vulnerable Code:**
```typescript
const response = await fetch(url, { ... });  // No URL validation!
```

**Description:**
The PDF proxy accepts any URL, allowing attackers to:
- Scan internal network (169.254.x.x, 10.x.x.x, etc.)
- Access cloud metadata endpoints (169.254.169.254)
- Exfiltrate data from internal services

**Fix:**
```typescript
// Add URL allowlist
const ALLOWED_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'www.dropbox.com',
];

const parsedUrl = new URL(url);

// Block internal IPs
const blockedPatterns = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^127\./,
  /^localhost$/i,
];

if (blockedPatterns.some(p => p.test(parsedUrl.hostname))) {
  return NextResponse.json({ error: 'Blocked URL' }, { status: 403 });
}
```

---

### 5. [HIGH] ✅ FIXED - No Rate Limiting on Public Endpoints

**Location:** `services/signing/src/server.ts:34-42`
**Status:** FIXED - Added @fastify/rate-limit with 100 req/min global limit

**Affected Endpoints:**
- `POST /sessions` - Session creation
- `GET /public/session-by-token` - Token validation
- `POST /public/sign` - Signature submission
- `GET /health` - Health check

**Description:**
No rate limiting allows:
- Brute force token guessing
- DDoS amplification via session creation
- Resource exhaustion

**Applied Fix:**
```typescript
import rateLimit from '@fastify/rate-limit';

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Stricter limits for sensitive endpoints
app.post('/sessions', {
  config: { rateLimit: { max: 10, timeWindow: '1 minute' } }
}, async (req, reply) => { ... });
```

---

### 6. [HIGH] ✅ FIXED - Certificate Download No Authorization

**Location:** `services/signing/src/server.ts:699-760`
**Status:** FIXED - Now requires user to be creator or have valid signer token

**Description:**
Anyone can download certificates for any completed session by guessing session IDs. Certificates contain:
- Document name and hash
- All signer emails/phones
- Signature images
- Blockchain record

**Applied Fix:**
```typescript
app.get('/sessions/:sessionId/certificate', async (req, reply) => {
  const userId = req.headers['x-user-id'] as string;

  // Allow access if: user is creator OR user is a signer
  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
    include: { signers: true },
  });

  const isCreator = session.userId === userId || session.creatorId === userId;
  const isSigner = session.signers.some(s => s.email === userEmail);

  if (!isCreator && !isSigner) {
    return reply.code(403).send({ error: 'forbidden' });
  }
  ...
});
```

---

## Medium Severity Findings

### 7. [MEDIUM] Document Serving Unauthenticated

**Location:** `services/signing/src/server.ts:579-629`

**Description:**
`/public/documents/:documentId` serves documents without verifying the requester has access to the associated session.

**Fix:** Add token validation or session check before serving documents.

---

### 8. [MEDIUM] Session ID Predictability

**Location:** Prisma schema uses CUID by default

**Description:**
While CUIDs are not sequential, they are not cryptographically random. Consider using UUIDv4 for session IDs to prevent enumeration.

**Fix:**
```prisma
model SigningSession {
  id String @id @default(uuid())
  ...
}
```

---

### 9. [MEDIUM] Signature Image Size Unlimited

**Location:** `services/signing/src/server.ts:383`

**Vulnerable Code:**
```typescript
signaturePayload: z.object({
  imageDataUrl: z.string().startsWith('data:image/')
})
```

**Description:**
No limit on signature image size. Attackers could submit massive base64 images to:
- Exhaust database storage
- Cause OOM on certificate generation
- Increase blockchain costs

**Fix:**
```typescript
imageDataUrl: z.string()
  .startsWith('data:image/')
  .max(500_000)  // ~375KB decoded image
  .refine(
    (s) => s.startsWith('data:image/png') || s.startsWith('data:image/jpeg'),
    'Only PNG and JPEG allowed'
  )
```

---

### 10. [MEDIUM] Missing Security Headers

**Location:** `apps/web-frontend/next.config.mjs`

**Description:**
Missing security headers leave the app vulnerable to:
- Clickjacking (no X-Frame-Options)
- XSS (no CSP)
- MIME sniffing (no X-Content-Type-Options)

**Fix:** Add to `next.config.mjs`:
```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
    ],
  }];
}
```

---

## Low Severity Findings

### 11. [LOW] Verbose Error Messages

**Location:** Various endpoints

**Description:**
Some error responses leak implementation details (e.g., `binding_mismatch`, `signer-notfound`). Consider generic error messages in production.

---

### 12. [LOW] Missing Request Logging

**Location:** Frontend API routes

**Description:**
Frontend API routes don't log requests, making incident investigation difficult. Add structured logging.

---

## Security Strengths

The codebase demonstrates several security best practices:

| Practice | Location | Status |
|----------|----------|--------|
| Cryptographically secure tokens | `security.ts:8-10` | ✅ 256-bit random |
| Constant-time comparison | `security.ts:18-36` | ✅ Prevents timing attacks |
| Token format validation | `security.ts:44-55` | ✅ Before DB query |
| IP/UA binding | `server.ts:286-298` | ✅ Session hijacking prevention |
| AES-256-GCM encryption | `keypairManager.ts:55-76` | ✅ For keypairs |
| Zod schema validation | `server.ts` (all endpoints) | ✅ Input validation |
| Idempotency support | `server.ts:62-64` | ✅ Duplicate prevention |
| Resend rate limiting | `server.ts:888-889` | ✅ 5 max, 5min interval |
| Audit logging | `server.ts` (all mutations) | ✅ Full trail |
| AWS Secrets Manager | `secretsManager.ts` | ✅ Production secrets |
| Parameterized queries | Prisma ORM | ✅ SQL injection prevention |

---

## Recommended Priority Order

1. **Immediate (Before any deployment):**
   - Update Next.js to 15.5.8+
   - Add authentication to `/sessions/finalize`
   - Add authentication to `/sessions/:id/certificate`

2. **Before production:**
   - Restrict CORS origins
   - Add rate limiting
   - Fix PDF proxy SSRF
   - Add security headers

3. **Soon after launch:**
   - Limit signature image size
   - Add document access control
   - Switch to UUIDv4 for session IDs

4. **Ongoing:**
   - Regular dependency audits
   - Security logging improvements
   - Penetration testing

---

## Verification Commands

```bash
# Check Next.js version
cd apps/web-frontend && cat package.json | grep '"next"'

# Run dependency audit
pnpm audit

# Test CORS
curl -H "Origin: https://evil.com" -I http://localhost:4030/health

# Test PDF proxy SSRF
curl "http://localhost:3000/api/proxy-pdf?url=http://169.254.169.254/latest/meta-data/"
```

---

*Report generated by security review on December 13, 2025*
