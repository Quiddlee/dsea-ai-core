import { createHash } from 'node:crypto';

export function generateHash(seed: string) {
  return createHash('sha256').update(seed).digest('hex');
}
