# SignaTrust Infrastructure

Local development environment setup using Docker Compose.

## Quick Start

```bash
# Start all services
docker-compose -f infra/docker-compose.yml up -d

# Check status
docker-compose -f infra/docker-compose.yml ps

# View logs
docker-compose -f infra/docker-compose.yml logs -f

# Stop all services
docker-compose -f infra/docker-compose.yml down

# Stop and remove all data
docker-compose -f infra/docker-compose.yml down -v
```

## Services

| Service | Port | Purpose | URL/Connection |
|---------|------|---------|----------------|
| PostgreSQL | 5432 | Main database | `postgresql://signatrust:signatrust@localhost:5432/signatrust` |
| Redis | 6379 | Cache & sessions | `redis://localhost:6379` |
| LocalStack | 4566 | AWS S3 emulator | `http://localhost:4566` |
| MailHog | 8025 | Email testing UI | http://localhost:8025 |
| MailHog SMTP | 1025 | SMTP server | `smtp://localhost:1025` |

## After Starting Docker

### 1. Run Database Migrations

```bash
cd services/signing
npx prisma migrate dev
```

### 2. Configure Environment Variables

**Backend** (`services/signing/.env`):
```bash
DATABASE_URL="postgresql://signatrust:signatrust@localhost:5432/signatrust"
REDIS_URL="redis://localhost:6379"

# LocalStack S3
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_REGION="us-east-1"
AWS_ENDPOINT_URL="http://localhost:4566"
S3_BUCKET="signatrust-documents"

# Solana (devnet)
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"
SOLANA_PROGRAM_ID="7Vd926mcQaYRFXhwUGpwchcxkPgerjAb32X7xvobfSJ4"
KEYPAIR_MASTER_KEY="<your-32-byte-hex-key>"

# Twilio SMS (or use dev mode)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_NUMBER=""

# Email (MailHog for local dev)
EMAIL_HOST="localhost"
EMAIL_PORT="1025"
EMAIL_USER=""
EMAIL_PASS=""

FRONTEND_URL="http://localhost:3000"
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd services/signing
pnpm dev

# Terminal 2: Frontend
cd apps/web-frontend
pnpm dev
```

## Testing LocalStack S3

```bash
# List buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# Upload test file
aws --endpoint-url=http://localhost:4566 s3 cp README.md s3://signatrust-documents/

# List bucket contents
aws --endpoint-url=http://localhost:4566 s3 ls s3://signatrust-documents/
```

## Testing Email with MailHog

1. Start services: `docker-compose up -d`
2. Open http://localhost:8025 in browser
3. Trigger any email-sending action in the app
4. All emails appear in MailHog UI (not actually sent)

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port (Windows)
netstat -ano | findstr :5432

# Kill the process
taskkill /F /PID <pid>
```

### Reset Everything

```bash
# Stop containers and remove volumes
docker-compose -f infra/docker-compose.yml down -v

# Remove named volumes
docker volume rm signatrust-postgres-data signatrust-redis-data signatrust-localstack-data

# Start fresh
docker-compose -f infra/docker-compose.yml up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f infra/docker-compose.yml ps postgres

# View PostgreSQL logs
docker-compose -f infra/docker-compose.yml logs postgres

# Connect directly
docker exec -it signatrust-postgres psql -U signatrust -d signatrust
```

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Main dev environment |
| `docker-compose.dev.yml` | Legacy (includes engine-rust) |
| `localstack-init.sh` | S3 bucket initialization |
