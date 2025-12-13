# Solana Program Build & Deployment Guide

## Prerequisites

### 1. Install Solana CLI Tools

```bash
# Install Solana CLI (Windows, macOS, Linux)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version

# Should output: solana-cli 1.18+ (or newer)
```

### 2. Configure Solana CLI

```bash
# Set to Devnet for testing
solana config set --url https://api.devnet.solana.com

# Create a new keypair for deploying (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Get your public key
solana address

# Airdrop SOL for deployment fees (Devnet only)
solana airdrop 2

# Check balance
solana balance
```

## Building the Solana Program

### Step 1: Build for Solana BPF

```bash
cd services/engine-rust

# Build the Solana program
cargo build-sbf --features onchain

# Or use the older command if you have an older Solana version
cargo build-bpf --features onchain
```

The compiled program will be in:
```
target/deploy/engine_rust.so
```

### Step 2: Verify the Build

```bash
# Check the program size
ls -lh target/deploy/engine_rust.so

# Should be < 200 KB for deployment
```

## Deploying to Devnet

### Step 1: Deploy the Program

```bash
# Deploy to Devnet
solana program deploy target/deploy/engine_rust.so

# Output will show:
# Program Id: <YOUR_PROGRAM_ID>
```

**IMPORTANT**: Save the Program ID! You'll need it for configuration.

### Step 2: Verify Deployment

```bash
# Check program info
solana program show <YOUR_PROGRAM_ID>

# Should show:
# - Program Id
# - Owner (your address)
# - Data Length
```

### Step 3: Update Environment Configuration

Add the Program ID to your `.env` file:

```env
SOLANA_PROGRAM_ID="<YOUR_PROGRAM_ID_FROM_DEPLOYMENT>"
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"
```

## Testing the Deployed Program

### Create a Test Document

```bash
# Use the included test script
cd services/engine-rust
node test-solana-transaction.js
```

### Check Transaction on Explorer

Visit: `https://explorer.solana.com/tx/<TRANSACTION_SIGNATURE>?cluster=devnet`

## Program Upgrade

```bash
# Upgrade existing program
solana program deploy --program-id <YOUR_PROGRAM_ID> target/deploy/engine_rust.so
```

## Troubleshooting

### "Insufficient funds" Error

```bash
# Request more SOL from faucet
solana airdrop 2

# Or use the web faucet
# https://faucet.solana.com/
```

###Failed Deployment - Program Too Large

```bash
# Optimize the build
cargo build-sbf --features onchain --release

# Check size again
ls -lh target/deploy/engine_rust.so
```

### "Invalid keypair" Error

```bash
# Verify keypair format
solana-keygen verify <pubkey> ~/.config/solana/id.json
```

## Production Deployment (Mainnet)

**WARNING**: Deploying to mainnet requires real SOL and is permanent!

```bash
# Switch to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Deploy (costs ~1-3 SOL depending on program size)
solana program deploy target/deploy/engine_rust.so

# Update production .env with mainnet Program ID
```

## Program Instructions

Our program supports 3 instructions:

### 1. CreateDocument
- Creates a new document account
- Requires: document hash, list of authorized signers
- Sets status to "Pending"

### 2. SignDocument
- Adds a signature to the document
- Validates signer authorization
- Prevents duplicate signatures
- Auto-completes when all signers have signed

### 3. UpdateStatus
- Allows creator to manually update status
- Only creator can call this

## Next Steps

After deployment:
1. Update `.env` with `SOLANA_PROGRAM_ID`
2. Restart services to load new config
3. Test with outbox worker
4. Monitor transactions on Solana Explorer

## Resources

- [Solana CLI Docs](https://docs.solana.com/cli)
- [Program Deployment](https://docs.solana.com/cli/deploy-a-program)
- [Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [Solana Cookbook](https://solanacookbook.com/)
