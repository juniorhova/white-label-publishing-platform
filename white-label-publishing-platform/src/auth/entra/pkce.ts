import { createHash } from 'crypto'

export const createCodeChallenge = (codeVerifier: string): string =>
  createHash('sha256').update(codeVerifier).digest('base64url')
