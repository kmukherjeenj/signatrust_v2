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
    // Initialize connection to Solana network
    const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
  
    // Load payer keypair from environment variable
    const payerPrivateKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PAYER_PRIVATE_KEY));
    const payerKeypair = Keypair.fromSecretKey(payerPrivateKey);
  
    console.log("Payer public key:", payerKeypair.publicKey.toBase58());
  
    // Create a new keypair for demonstration
    const newKeypair = Keypair.generate();
    console.log("New keypair public key:", newKeypair.publicKey.toBase58());
  
    // Check payer balance
    const payerBalance = await connection.getBalance(payerKeypair.publicKey);
    console.log(`Payer balance: ${payerBalance / LAMPORTS_PER_SOL} SOL`);
  
    // Create a simple transaction (transfer 0.01 SOL to the new keypair)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: newKeypair.publicKey,
        lamports: LAMPORTS_PER_SOL / 100,
      })
    );
  
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerKeypair.publicKey;
  
    console.log("Transaction created:", transaction);
  
    // Sign and send transaction
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerKeypair]
      );
      console.log("Transaction sent successfully. Signature:", signature);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  }
  
  main().catch(console.error);