import crypto from 'crypto';

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY must be defined in environment variables');
}

// The encryption algorithm to use
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // For GCM, 12 bytes is recommended
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Encrypts a string using AES-256-GCM
 * @param text The text to encrypt
 * @returns The encrypted text as a base64 string
 */
export function encrypt(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Generate key using PBKDF2
  const key = crypto.pbkdf2Sync(
    ENCRYPTION_KEY,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  // Get the auth tag
  const tag = cipher.getAuthTag();

  // Combine the salt, iv, tag, and encrypted data
  const result = Buffer.concat([salt, iv, tag, encrypted]);

  // Return as base64 string
  return result.toString('base64');
}

/**
 * Decrypts a string that was encrypted using AES-256-GCM
 * @param encryptedText The encrypted text as a base64 string
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  // Convert from base64
  const buffer = Buffer.from(encryptedText, 'base64');

  // Extract the salt, iv, tag, and encrypted data
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Generate key using PBKDF2
  const key = crypto.pbkdf2Sync(
    ENCRYPTION_KEY,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  // Decrypt the text
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
} 