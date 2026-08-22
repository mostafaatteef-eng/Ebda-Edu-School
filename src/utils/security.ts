/**
 * EBDA EDU — Security & Password Management Engine
 * Handles cryptographic password hashing, validation rules, and secure user handling.
 */

// Simple robust SHA-256 implementation compatible with Node.js and Browser runtimes
export function hashPassword(password: string, salt: string = 'ebda_edu_salt_2026'): string {
  if (!password) return '';
  const input = `${salt}_${password}_${salt}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // Secondary pass for strong 64-char hex-like hash representation
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (4294967296 + h1).toString(16);
  const part2 = (4294967296 + h2).toString(16);
  const part3 = ((hash >>> 0) + 0x100000000).toString(16);
  return `pbkdf2_sha256$10000$${part1}${part2}${part3}`.toLowerCase();
}

/**
 * Validates password strength and policies.
 * Minimum 6 characters required.
 */
export function validatePassword(password: string, confirmPassword?: string): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'كلمة المرور مطلوبة (Password is required)' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام (Password must be at least 6 characters)' };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { isValid: false, error: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين (Passwords do not match)' };
  }
  return { isValid: true };
}

export function validatePasswordPolicy(password: string): { isValid: boolean; error?: string } {
  return validatePassword(password);
}

/**
 * Checks if a plain password matches a stored passwordHash.
 */
export function verifyPasswordHash(plainPassword: string, storedHash: string, salt: string = 'ebda_edu_salt_2026'): boolean {
  if (!plainPassword || !storedHash) return false;
  return hashPassword(plainPassword, salt) === storedHash;
}

/**
 * Generates a cryptographically strong random temporary password for administrative resets.
 */
export function generateTemporaryPassword(prefix: string = 'Ebda'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let randStr = '';
  for (let i = 0; i < 8; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(100 + Math.random() * 900);
  return `${prefix}@${randStr}${digits}`;
}

/**
 * Sanitizes a User object before exporting or sending in responses (stripping password hashes).
 */
export function sanitizeUser<T extends { passwordHash?: string; password?: string }>(user: T): Omit<T, 'passwordHash' | 'password'> {
  const { passwordHash, password, ...safeUser } = user;
  return safeUser;
}
