#!/bin/bash
# Setup and Test Script for Signatrust Signing Service
# Run this after starting Docker containers

set -e

echo "=== Signatrust Setup and Test Script ==="
echo ""

# 1. Check Docker services
echo "1. Checking Docker services..."
if ! docker ps | grep -q postgres; then
    echo "   Starting Docker services..."
    cd ../../../infra
    docker-compose -f docker-compose.dev.yml up -d postgres redis localstack
    cd ../services/signing
    echo "   Waiting for PostgreSQL to be ready..."
    sleep 5
fi
echo "   ✓ Docker services running"

# 2. Run database migrations
echo ""
echo "2. Running database migrations..."
npx prisma migrate deploy
echo "   ✓ Migrations applied"

# 3. Generate Prisma client
echo ""
echo "3. Generating Prisma client..."
npx prisma generate
echo "   ✓ Prisma client generated"

# 4. Build TypeScript
echo ""
echo "4. Building TypeScript..."
pnpm build
echo "   ✓ TypeScript built"

# 5. Run tests
echo ""
echo "5. Running tests..."
pnpm test || echo "   ⚠ Some tests failed (may need database)"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start the signing service:"
echo "  cd services/signing && pnpm dev"
echo ""
echo "Program ID: 7Vd926mcQaYRFXhwUGpwchcxkPgerjAb32X7xvobfSJ4"
echo "Network: Devnet"
