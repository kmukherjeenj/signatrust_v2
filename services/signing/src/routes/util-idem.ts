import { Redis } from 'ioredis';
const r = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export async function ensureIdempotent(key: string, ttlSec = 86400) {
  const ok = await r.set(`idem:${key}`, '1', 'EX', ttlSec, 'NX');
  if (ok !== 'OK') throw new Error('IdempotencyKeyAlreadyUsed');
}