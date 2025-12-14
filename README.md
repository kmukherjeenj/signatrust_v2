# SignaTrust

**Blockchain-Verified Document Signing Platform**

A secure, decentralized document signing system with signatures recorded on the Solana blockchain.

## Team

| Name | Role |
|------|------|
| Kushal Mukherjee | Project Lead |
| Jonathan Philips | Developer |
| Ameer Ahmed | Developer |

## Features

- **SMS Magic Links** - Signers receive signing links via SMS (Twilio) or email
- **Blockchain Verification** - All signatures recorded on Solana (devnet/mainnet)
- **Multi-Party Signing** - Support for multiple signers per document
- **Secure Tokens** - Single-use, IP/UA-bound signing tokens
- **Real-time Status** - Track signing progress across all parties
- **Session Management** - Cancel sessions, set deadlines, resend invites
- **Cancellation Recording** - Session cancellations recorded on blockchain

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Frontend  │────▶│ Signing Service │────▶│     Solana      │
│    (Next.js)    │     │    (Fastify)    │     │   Blockchain    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                        ┌──────┴──────┐
                        ▼             ▼
                   PostgreSQL    S3 Storage
```

### Components

| Component | Tech Stack | Purpose |
|-----------|-----------|---------|
| Web Frontend | Next.js 16, React, Tailwind | User interface, PDF viewing, signature capture |
| Signing Service | Fastify, Prisma, TypeScript | Session management, token handling, API |
| Solana Program | Rust, Anchor | On-chain document & signature storage |
| Outbox Worker | TypeScript | Async blockchain transaction processing |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL, Redis)
- pnpm

### Setup

```bash
# Clone and install
git clone <repo>
cd signatrust
pnpm install

# Start infrastructure
docker-compose -f infra/docker-compose.yml up -d

# Run database migrations
cd services/signing
npx prisma migrate dev

# Start services
pnpm dev  # In services/signing
pnpm dev  # In apps/web-frontend
```

### Environment Variables

```bash
# services/signing/.env
DATABASE_URL="postgresql://signatrust:signatrust@localhost:5432/signatrust"
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"
SOLANA_PROGRAM_ID="7Vd926mcQaYRFXhwUGpwchcxkPgerjAb32X7xvobfSJ4"
KEYPAIR_MASTER_KEY="<your-master-key>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_FROM_NUMBER="+15551234567"

# Email (optional fallback)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_USER="user"
EMAIL_PASS="pass"
```

## Signing Flow

```
1. CREATE SESSION
   └─▶ User submits document name + signer phone numbers
   └─▶ Session created in database
   └─▶ Secure tokens generated for each signer
   └─▶ SMS magic links sent via Twilio
   └─▶ Document account created on Solana

2. SIGN DOCUMENT
   └─▶ Signer clicks magic link (single-use, IP-bound)
   └─▶ Views PDF document in browser
   └─▶ Draws signature on canvas
   └─▶ Signature submitted and recorded on Solana

3. FINALIZATION
   └─▶ When all parties sign, session marked complete
   └─▶ Final blockchain transaction confirms completion
   └─▶ All signers notified via SMS/email
```

## Session Management

### Cancel/Void Sessions
```
POST /sessions/:id/cancel
Body: { reason?: "Optional cancellation reason" }
```
- Only pending sessions can be cancelled
- All pending signer tokens are invalidated
- Cancellation recorded on Solana blockchain
- All signers notified via SMS/email
- Cannot be undone once blockchain transaction confirms

### Session Deadlines
```
POST /sessions  (with expiresAt)
Body: { ..., expiresAt: "2025-12-31T23:59:59Z" }

PATCH /sessions/:id
Body: { expiresAt: "2025-12-31T23:59:59Z" }  // Set or update
Body: { expiresAt: null }                     // Remove deadline
```
- Sessions automatically expire at deadline
- Expired sessions reject new signatures
- Tokens generated respect session deadline

### Resend Invites
```
POST /sessions/:id/signers/:signerId/resend  // Single signer
POST /sessions/:id/resend-all                 // All pending signers
```
- Rate limited: max 5 resends per signer
- Minimum 5 minutes between resends
- Old tokens invalidated, new tokens generated
- Fresh SMS/email sent to signer

### Sequential Signing
```
POST /sessions  (with sequentialSigning: true)
PATCH /sessions/:id/sequential-signing
Body: { enabled: true | false }
```
- Signers must sign in orderIndex order
- Later signers blocked until previous complete
- Can be toggled on/off for pending sessions

### Audit Log
```
GET /sessions/:id/audit-log
Response: { sessionId, eventCount, events: [...] }
```
- Complete timeline of session events
- Includes: creation, signatures, resends, cancellations
- IP/UserAgent tracking for each action
- Human-readable descriptions

## API Endpoints

### Signing Service (port 4030)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | Create signing session |
| GET | `/sessions` | List sessions (with filters) |
| POST | `/sessions/:id/cancel` | Cancel/void a session |
| PATCH | `/sessions/:id` | Update session (deadline) |
| PATCH | `/sessions/:id/sequential-signing` | Enable/disable sequential signing |
| GET | `/sessions/:id/audit-log` | Get session audit log |
| POST | `/sessions/:id/signers/:signerId/resend` | Resend invite to signer |
| POST | `/sessions/:id/resend-all` | Resend all pending invites |
| GET | `/public/session-by-token` | Get session by signer token |
| POST | `/public/sign` | Submit signature |
| GET | `/public/documents/:id` | Serve document |
| GET | `/health` | Health check |

### Frontend API Routes (port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Proxy to signing service |
| GET | `/api/sessions` | Proxy session list |
| POST | `/api/sessions/[id]/cancel` | Proxy cancel session |
| PATCH | `/api/sessions/[id]` | Proxy update session |
| PATCH | `/api/sessions/[id]/sequential-signing` | Proxy sequential signing toggle |
| GET | `/api/sessions/[id]/audit-log` | Proxy audit log |
| POST | `/api/sessions/[id]/signers/[signerId]/resend` | Proxy resend invite |
| POST | `/api/sessions/[id]/resend-all` | Proxy resend all |
| GET | `/api/session-by-token` | Proxy token validation |
| POST | `/api/sign` | Proxy signature submission |
| GET | `/api/documents/[id]` | Proxy document serving |
| GET | `/api/proxy-pdf` | CORS proxy for external PDFs |

## Database Schema

```prisma
model SigningSession {
  id                 String    @id
  documentId         String
  creatorId          String
  status             String    // pending | completed | cancelled
  chainRecord        String?   // Solana document account pubkey
  expiresAt          DateTime? // Optional session deadline
  cancelledAt        DateTime? // When session was cancelled
  cancelledReason    String?   // Optional cancellation reason
  cancelChainTx      String?   // Blockchain tx for cancellation
  sequentialSigning  Boolean   @default(false)  // Enforce signing order
  signers            Signer[]
}

model Signer {
  id           String    @id
  sessionId    String
  email        String?
  phone        String?   // For SMS magic links
  status       String    // pending | signed
  signedAt     DateTime?
  resendCount  Int       @default(0)  // Times invite was resent
  lastResendAt DateTime?              // Last resend timestamp
}

model SignerToken {
  id            String    @id
  signerId      String
  token         String    @unique
  usedAt        DateTime?
  boundIp       String?
  boundUa       String?
  invalidatedAt DateTime? // When token was invalidated
  invalidatedBy String?   // 'cancel' | 'resend' | 'expired'
}

model Outbox {
  id          String    @id
  type        String    // blockchain.create_document | add_signature | finalize | cancel_document
  payload     Json
  processedAt DateTime?
}
```

## Solana Program

The on-chain program stores:

```rust
pub enum DocumentStatus {
    Pending,    // 0 - Awaiting signatures
    Signed,     // 1 - At least one signature
    Completed,  // 2 - All signatures collected
    Cancelled,  // 3 - Session voided by creator
}

pub struct DocumentAccount {
    pub document_hash: [u8; 32],   // SHA-256 of document
    pub status: DocumentStatus,    // Pending | Signed | Completed | Cancelled
    pub signers: Vec<Pubkey>,      // Authorized signers
    pub signatures: Vec<Signature>,// Collected signatures
    pub created_at: i64,
    pub creator: Pubkey,
}
```

**Program ID (Devnet):** `7Vd926mcQaYRFXhwUGpwchcxkPgerjAb32X7xvobfSJ4`

### Build & Deploy

```bash
cd services/engine-rust
cargo-build-sbf --features onchain --no-default-features
solana program deploy target/deploy/engine_rust.so
```

## Testing

```bash
# Run automated E2E test
cd services/signing
npx tsx scripts/test-full-flow.ts

# Manual test
1. Open http://localhost:3000
2. Create session with phone number
3. Open signing URL
4. Sign document
5. Verify on Solana Explorer
```

## Project Structure

```
signatrust/
├── apps/
│   └── web-frontend/          # Next.js frontend
│       ├── app/
│       │   ├── page.tsx       # Home - create session
│       │   ├── sign/[token]/  # Signing page
│       │   └── api/           # API routes
│       └── public/
├── services/
│   ├── signing/               # Main signing service
│   │   ├── src/
│   │   │   ├── server.ts      # Fastify server
│   │   │   ├── services/      # Business logic
│   │   │   │   ├── smsService.ts
│   │   │   │   ├── emailService.ts
│   │   │   │   ├── solanaClient.ts
│   │   │   │   └── keypairManager.ts
│   │   │   └── workers/
│   │   │       └── outboxWorker.ts
│   │   └── prisma/
│   └── engine-rust/           # Solana program (Rust)
│       └── src/lib.rs
└── infra/
    └── docker-compose.yml     # PostgreSQL, Redis
```

## Security Features

- **Token Binding** - Tokens bound to IP address and User-Agent on first use
- **Single-Use Tokens** - Each signing link works only once
- **Constant-Time Comparison** - Prevents timing attacks on token validation
- **Encrypted Keypairs** - Signer keypairs encrypted with AES-256-GCM
- **Blockchain Immutability** - Signatures permanently recorded on Solana
- **Rate Limiting** - 100 requests/minute global limit, stricter on sensitive endpoints
- **CORS Protection** - Origin allowlist restricts cross-origin requests
- **SSRF Protection** - PDF proxy validates hosts and blocks internal IPs
- **Input Validation** - Zod schema validation on all API endpoints

See `SECURITY_AUDIT.md` for full security audit details.

## Current Status

| Feature | Status |
|---------|--------|
| Session Creation | ✅ Complete |
| SMS Magic Links (Twilio) | ✅ Complete |
| Email Notifications | ✅ Complete |
| PDF Document Viewing | ✅ Complete |
| Signature Capture | ✅ Complete |
| Solana Integration | ✅ Complete |
| Multi-Signer Support | ✅ Complete |
| Token Security | ✅ Complete |
| Outbox Pattern | ✅ Complete |
| Cancel/Void Sessions | ✅ Complete |
| Session Deadlines | ✅ Complete |
| Resend Invites | ✅ Complete |
| Blockchain Cancellation | ✅ Complete |
| Session Audit Log | ✅ Complete |
| Sequential Signing | ✅ Complete |
| UI/UX Polish | ✅ Complete |
| Security Audit | ✅ Complete |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding guidelines, and team workflow.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development setup and guidelines
- [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) - Current deployment state
- [NEXT_STEPS.md](NEXT_STEPS.md) - Roadmap and completed features
- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) - Security review findings

## License

MIT
