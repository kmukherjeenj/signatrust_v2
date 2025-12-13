const bs58 = require('bs58');

console.log('bs58 module:', bs58);

// Check if bs58 is an object with a default property
const bs58Lib = bs58.default || bs58;

console.log('encode function:', bs58Lib.encode);

try {
  const testData = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = bs58Lib.encode(testData);
  console.log('Encoded:', encoded);

  const decoded = bs58Lib.decode(encoded);
  console.log('Decoded:', Array.from(decoded));
} catch (error) {
  console.error('Error during bs58 operations:', error.message);
}