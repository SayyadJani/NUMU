import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

@Injectable()
export class PasswordService {
  /**
   * Hashes a password using Argon2id with OWASP-recommended parameters.
   */
  async hash(password: string): Promise<string> {
    return hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

  /**
   * Verifies a candidate password against an Argon2id hash.
   */
  async verify(hashStr: string, candidate: string): Promise<boolean> {
    try {
      return await verify(hashStr, candidate);
    } catch {
      return false;
    }
  }

  /**
   * Validates password complexity: minimum 8 chars, at least one letter and one number.
   */
  validateComplexity(password: string): boolean {
    if (!password || password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
  }
}
