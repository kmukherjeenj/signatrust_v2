# Contributing to SignaTrust

## Team

| Name | Role | GitHub |
|------|------|--------|
| Kushal Mukherjee | Project Lead | @kmukherjeenj |
| Jonathan Philips | Developer | |
| Ameer Ahmed | Developer | |

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker Desktop
- Git

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/kmukherjeenj/signatrust_v2.git
cd signatrust

# Install dependencies
pnpm install

# Copy environment files
cp services/signing/.env.example services/signing/.env
cp apps/web-frontend/.env.example apps/web-frontend/.env.local

# Start infrastructure (PostgreSQL, Redis)
docker-compose -f infra/docker-compose.yml up -d

# Run database migrations
cd services/signing
npx prisma migrate dev

# Start development servers
pnpm dev  # In services/signing (port 4030)
pnpm dev  # In apps/web-frontend (port 3000)
```

---

## Project Structure

```
signatrust/
├── apps/
│   ├── web-frontend/          # Next.js 16 frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   │   └── ui/            # Reusable UI components
│   │   └── public/            # Static assets
│   └── api-gateway/           # Fastify API gateway (optional)
├── services/
│   ├── signing/               # Main backend service
│   │   ├── src/
│   │   │   ├── server.ts      # Fastify server
│   │   │   ├── services/      # Business logic
│   │   │   └── workers/       # Background workers
│   │   └── prisma/            # Database schema
│   └── engine-rust/           # Solana program (Rust)
├── infra/                     # Docker configs
└── docs/                      # Documentation
```

---

## Development Workflow

### Branch Strategy

```
master (main branch)
  ├── feature/xxx     # New features
  ├── fix/xxx         # Bug fixes
  └── docs/xxx        # Documentation updates
```

### Creating a Feature Branch

```bash
# Always start from latest master
git checkout master
git pull origin master

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit frequently
git add .
git commit -m "feat: description of change"

# Push and create PR
git push -u origin feature/your-feature-name
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new signing template feature
fix: resolve token expiration bug
docs: update API documentation
style: format code with prettier
refactor: restructure session service
test: add unit tests for keypair manager
chore: update dependencies
```

---

## Running Tests

```bash
# Backend unit tests
cd services/signing
pnpm test                    # Run all tests
pnpm test:watch              # Watch mode
pnpm test:coverage           # With coverage

# TypeScript checks
pnpm typecheck               # In any package

# Full regression test
cd services/signing && pnpm test
cd apps/web-frontend && pnpm build
cd apps/api-gateway && pnpm build
```

### Test Requirements

- **Unit tests**: Run without external services
- **Integration tests**: Require Docker (PostgreSQL, Redis, LocalStack)

```bash
# Start test infrastructure
docker-compose -f infra/docker-compose.yml up -d

# Run integration tests
pnpm test
```

---

## Code Style

### Formatting

- **Prettier** for code formatting
- **ESLint** for linting

```bash
# Format code
pnpm prettier --write .

# Lint
pnpm lint
```

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions

### React/Next.js

- Functional components only
- Use `'use client'` directive for client components
- Wrap `useSearchParams()` in Suspense boundaries

---

## Environment Variables

### Backend (`services/signing/.env`)

```bash
# Database
DATABASE_URL="postgresql://signatrust:signatrust@localhost:5432/signatrust"

# Solana
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_PROGRAM_ID="7Vd926mcQaYRFXhwUGpwchcxkPgerjAb32X7xvobfSJ4"
KEYPAIR_MASTER_KEY="<32-byte-hex-key>"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_FROM_NUMBER="+15551234567"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`apps/web-frontend/.env.local`)

```bash
# Database (for NextAuth)
DATABASE_URL="postgresql://signatrust:signatrust@localhost:5432/signatrust"

# Auth
AUTH_SECRET="<random-32-char-string>"

# Email (for magic links)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="app-password"
EMAIL_FROM="SignaTrust <noreply@signatrust.io>"

# Backend
SIGNING_SERVICE_URL="http://localhost:4030"
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `services/signing/src/server.ts` | Main API server |
| `services/signing/prisma/schema.prisma` | Database schema |
| `apps/web-frontend/app/page.tsx` | Home page (create session) |
| `apps/web-frontend/app/sign/[token]/page.tsx` | Signing page |
| `apps/web-frontend/app/dashboard/page.tsx` | User dashboard |
| `apps/web-frontend/components/ui/` | Reusable UI components |

---

## Common Tasks

### Add a New API Endpoint

1. Add route in `services/signing/src/server.ts`
2. Add Zod schema for validation
3. Create frontend proxy in `apps/web-frontend/app/api/`
4. Update README.md API documentation

### Add a New UI Component

1. Create component in `apps/web-frontend/components/ui/`
2. Export from `components/ui/index.ts`
3. Use consistent styling (Tailwind)
4. Add accessibility attributes

### Database Schema Change

```bash
cd services/signing

# Edit prisma/schema.prisma
# Then run migration
npx prisma migrate dev --name describe_your_change

# Generate client
npx prisma generate
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :4030
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /F /PID <pid>
```

### Database Connection Failed

```bash
# Check Docker is running
docker ps

# Restart infrastructure
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up -d
```

### Prisma Client Out of Sync

```bash
cd services/signing
npx prisma generate
```

---

## Pull Request Checklist

Before submitting a PR:

- [ ] Code compiles without errors (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test`)
- [ ] Frontend builds (`pnpm build` in web-frontend)
- [ ] Commit messages follow convention
- [ ] Documentation updated if needed
- [ ] No console.log statements left in code
- [ ] No hardcoded secrets or credentials

---

## Contact

- **Project Issues**: [GitHub Issues](https://github.com/kmukherjeenj/signatrust_v2/issues)
- **Team Chat**: [Add your team chat link]

---

## Documentation

- `README.md` - Project overview and features
- `DEPLOYMENT_STATUS.md` - Current deployment state
- `NEXT_STEPS.md` - Roadmap and completed features
- `SECURITY_AUDIT.md` - Security review findings
- `services/engine-rust/SOLANA_BUILD_DEPLOY.md` - Solana deployment guide
