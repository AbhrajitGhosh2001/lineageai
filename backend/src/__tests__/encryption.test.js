import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

const KEY_HEX = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
const ALGORITHM = 'aes-256-gcm';

function encrypt(plaintext) {
  if (plaintext == null) return null;
  const key = Buffer.from(KEY_HEX, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(ciphertext) {
  if (ciphertext == null) return null;
  const [ivHex, authTagHex, encHex] = ciphertext.split(':');
  const key = Buffer.from(KEY_HEX, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

describe('Field-level encryption (AES-256-GCM)', () => {
  it('encrypts and decrypts a string', () => {
    const original = 'Jane Smith';
    const ciphertext = encrypt(original);
    expect(ciphertext).not.toBe(original);
    expect(ciphertext).toContain(':');
    expect(decrypt(ciphertext)).toBe(original);
  });

  it('returns null for null input', () => {
    expect(encrypt(null)).toBeNull();
    expect(decrypt(null)).toBeNull();
  });

  it('produces unique ciphertexts for same plaintext (random IV)', () => {
    const a = encrypt('test');
    const b = encrypt('test');
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe('test');
    expect(decrypt(b)).toBe('test');
  });

  it('handles special characters and unicode', () => {
    const name = 'María José Ñoño';
    expect(decrypt(encrypt(name))).toBe(name);
  });

  it('handles email addresses', () => {
    const email = 'patient+test@genetics-clinic.com';
    expect(decrypt(encrypt(email))).toBe(email);
  });
});
