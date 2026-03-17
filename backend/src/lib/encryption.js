const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.ENCRYPTION_KEY;

function getKey() {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(KEY_HEX, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 */
function encrypt(plaintext) {
  if (plaintext == null) return null;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a value produced by encrypt().
 */
function decrypt(ciphertext) {
  if (ciphertext == null) return null;
  const [ivHex, authTagHex, encHex] = ciphertext.split(':');
  if (!ivHex || !authTagHex || !encHex) return null;
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Decrypt PII fields on a patient record returned from Prisma.
 */
function decryptPatient(p) {
  if (!p) return p;
  return {
    ...p,
    firstName: decrypt(p.firstNameEnc),
    lastName: decrypt(p.lastNameEnc),
    email: decrypt(p.emailEnc),
    phone: decrypt(p.phoneEnc),
    familyMembers: p.familyMembers ? p.familyMembers.map(decryptFamilyMember) : undefined,
  };
}

function decryptFamilyMember(m) {
  if (!m) return m;
  return {
    ...m,
    firstName: decrypt(m.firstNameEnc),
    lastName: decrypt(m.lastNameEnc),
    email: decrypt(m.emailEnc),
    phone: decrypt(m.phoneEnc),
    patient: m.patient ? decryptPatient(m.patient) : undefined,
  };
}

module.exports = { encrypt, decrypt, decryptPatient, decryptFamilyMember };
