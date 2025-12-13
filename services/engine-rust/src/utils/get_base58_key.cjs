const fs = require('fs');
const bs58 = require('bs58');

// Use the default export if it exists, otherwise use the module as is
const bs58Lib = bs58.default || bs58;

// Replace with the path to your recovered key file
const keyPath = 'C:\\Users\\kmukh\\.config\\solana\\id2.json';

try {
    const keyData = fs.readFileSync(keyPath, 'utf8');
    const keyJson = JSON.parse(keyData);
    
    console.log('Key data:', keyJson);
    
    // Solana keypairs are stored as an array of numbers
    if (Array.isArray(keyJson)) {
      const privateKey = new Uint8Array(keyJson);
      const base58PrivateKey = bs58Lib.encode(privateKey);
      console.log('Base58 Private Key:', base58PrivateKey);
    } else {
      console.error('Unexpected key format. Expected an array of numbers. Received:', typeof keyJson);
    }
  } catch (error) {
    console.error('Error reading or processing the key file:', error.message);
  }