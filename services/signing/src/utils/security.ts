import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token
 * @param byteLength Number of random bytes (default: 32 = 256 bits)
 * @returns Hex-encoded token string
 */
export function generateSecureToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Performs constant-time string comparison to prevent timing attacks
 * @param a First string to compare
 * @param b Second string to compare
 * @returns True if strings are equal, false otherwise
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  // Convert strings to buffers for constant-time comparison
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  // If lengths don't match, still do comparison to avoid timing leak
  if (bufferA.length !== bufferB.length) {
    // Compare against itself to maintain constant time
    crypto.timingSafeEqual(bufferA, bufferA);
    return false;
  }

  // Use Node's built-in timing-safe comparison
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Validates token format (hexadecimal string of expected length)
 * @param token Token string to validate
 * @param expectedByteLength Expected byte length (default: 32)
 * @returns True if valid format, false otherwise
 */
export function isValidTokenFormat(token: string, expectedByteLength: number = 32): boolean {
  if (typeof token !== 'string') {
    return false;
  }

  // Hex encoding doubles the byte length
  const expectedLength = expectedByteLength * 2;

  // Check length and hex format
  const hexRegex = /^[0-9a-f]+$/i;
  return token.length === expectedLength && hexRegex.test(token);
}

/**
 * Generates a secure signer token with metadata
 * @returns Object containing token and creation timestamp
 */
export function generateSignerToken(): { token: string; createdAt: Date } {
  return {
    token: generateSecureToken(32), // 256-bit token
    createdAt: new Date(),
  };
}

/**
 * Hashes sensitive data using SHA-256
 * @param data Data to hash
 * @returns Hex-encoded hash
 */
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
