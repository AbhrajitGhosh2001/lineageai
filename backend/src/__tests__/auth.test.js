import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';

describe('JWT auth', () => {
  it('signs and verifies a token', () => {
    const payload = { userId: 'user-1', email: 'test@test.com', role: 'counselor' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe('user-1');
    expect(decoded.email).toBe('test@test.com');
  });

  it('rejects an expired token', () => {
    const token = jwt.sign({ userId: 'x' }, JWT_SECRET, { expiresIn: '-1s' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });

  it('rejects a tampered token', () => {
    const token = jwt.sign({ userId: 'x' }, JWT_SECRET);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => jwt.verify(tampered, JWT_SECRET)).toThrow();
  });
});
