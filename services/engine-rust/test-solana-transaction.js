import { 
    Connection, 
    Keypair, 
    PublicKey, 
    Transaction, 
    SystemProgram, 
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL 
  } from "@solana/web3.js";
  import dotenv from 'dotenv';
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  dotenv.config({ path: `${__dirname}/.env` });
  
  async function main() {
    const variableLedger = {}; // Object to hold variable states
  
    // Log environment variables
    variableLedger.SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
    variableLedger.SOLANA_PROGRAM_ID = process.env.SOLANA_PROGRAM_ID;
    variableLedger.SOLANA_FEE_PAYER = process.env.SOLANA_FEE_PAYER;
    variableLedger.SOLANA_PAYER_PRIVATE_KEY = process.env.SOLANA_PAYER_PRIVATE_KEY;
  
    console.log("Environment Variables:", variableLedger);
  
    // Force the use of the testnet URL
    const forcedSolanaRpcUrl = 'https://api.testnet.solana.com';
    const connection = new Connection(forcedSolanaRpcUrl, 'confirmed');
    variableLedger.connection = connection;
    console.log("Connected to Solana network at:", forcedSolanaRpcUrl);
  
    // Load payer keypair from environment variable
    const payerPrivateKey = Uint8Array.from(JSON.parse(variableLedger.SOLANA_PAYER_PRIVATE_KEY));
    variableLedger.payerPrivateKey = payerPrivateKey;
    const payerKeypair = Keypair.fromSecretKey(payerPrivateKey);
    variableLedger.payerKeypair = payerKeypair;
  
    console.log("Payer public key:", payerKeypair.publicKey.toBase58());
    variableLedger.payerPublicKey = payerKeypair.publicKey.toBase58();
  
    // Check payer balance
    const payerBalance = await connection.getBalance(payerKeypair.publicKey);
    variableLedger.payerBalance = payerBalance;
    console.log(`Payer balance: ${payerBalance / LAMPORTS_PER_SOL} SOL`);
  
    // Create a new keypair for demonstration
    const newKeypair = Keypair.generate();
    variableLedger.newKeypair = newKeypair;
    console.log("New keypair public key:", newKeypair.publicKey.toBase58());
    variableLedger.newKeypairPublicKey = newKeypair.publicKey.toBase58();
  
    // Create a simple transaction (transfer 0.01 SOL to the new keypair)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: newKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL / 100,
      })
    );
    variableLedger.transaction = transaction;
  
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    variableLedger.blockhash = blockhash;
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerKeypair.publicKey;
  
    console.log("Transaction created:", transaction);
    variableLedger.transactionDetails = {
      signatures: transaction.signatures,
      feePayer: transaction.feePayer.toBase58(),
      recentBlockhash: transaction.recentBlockhash,
      instructions: transaction.instructions.map(instr => ({
        keys: instr.keys,
        programId: instr.programId.toBase58(),
        data: instr.data.toString('hex')
      }))
    };
  
    // Sign and send transaction
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerKeypair]
      );
      console.log("Transaction sent successfully. Signature:", signature);
      variableLedger.transactionSignature = signature;
    } catch (error) {
      console.error("Error sending transaction:", error);
      variableLedger.error = error.message;
    }
  
    // Final variable ledger state
    console.log("Final Variable Ledger:", variableLedger);
  }
  
  main().catch(console.error);
  