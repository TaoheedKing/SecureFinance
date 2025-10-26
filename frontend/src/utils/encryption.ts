/**
 * End-to-End Encryption Utilities using Web Crypto API
 *
 * This module provides client-side encryption/decryption for sensitive financial data.
 * The encryption key is derived from the user's password and never leaves the client.
 *
 * Security Features:
 * - AES-GCM encryption (256-bit)
 * - PBKDF2 key derivation with salt
 * - Random IV for each encryption operation
 * - Zero-knowledge architecture (server never has access to decryption keys)
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Convert string to ArrayBuffer
 */
function str2ab(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Convert ArrayBuffer to string
 */
function ab2str(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function ab2base64(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base642ab(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const passwordBuffer = str2ab(password);

  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive actual encryption key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ encryptedData: string; iv: string }> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    str2ab(data)
  );

  return {
    encryptedData: ab2base64(encryptedBuffer),
    iv: ab2base64(iv.buffer),
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedBuffer = base642ab(encryptedData);
  const ivBuffer = base642ab(iv);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  return ab2str(decryptedBuffer);
}

/**
 * Encrypt a transaction object
 */
export async function encryptTransaction(
  transaction: {
    amount: number;
    description: string;
    category: string;
    merchant?: string;
  },
  key: CryptoKey
): Promise<{
  encrypted_data: string;
  iv: string;
  amount_encrypted: string;
}> {
  // Encrypt the full transaction data
  const transactionJson = JSON.stringify(transaction);
  const { encryptedData, iv } = await encryptData(transactionJson, key);

  // Also encrypt just the amount for server-side operations (if needed)
  const amountEncrypted = await encryptData(transaction.amount.toString(), key);

  return {
    encrypted_data: encryptedData,
    iv: iv,
    amount_encrypted: amountEncrypted.encryptedData,
  };
}

/**
 * Decrypt a transaction object
 */
export async function decryptTransaction(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<{
  amount: number;
  description: string;
  category: string;
  merchant?: string;
}> {
  const decryptedJson = await decryptData(encryptedData, iv, key);
  return JSON.parse(decryptedJson);
}

/**
 * Storage utilities for encryption salt
 * The salt is stored locally and used to derive the encryption key from the password
 */
export const SaltStorage = {
  /**
   * Save the encryption salt for a user
   */
  saveSalt(userId: number, salt: Uint8Array): void {
    const saltBase64 = ab2base64(salt.buffer);
    localStorage.setItem(`salt_${userId}`, saltBase64);
  },

  /**
   * Retrieve the encryption salt for a user
   */
  getSalt(userId: number): Uint8Array | null {
    const saltBase64 = localStorage.getItem(`salt_${userId}`);
    if (!saltBase64) return null;

    const saltBuffer = base642ab(saltBase64);
    return new Uint8Array(saltBuffer);
  },

  /**
   * Remove the encryption salt for a user
   */
  removeSalt(userId: number): void {
    localStorage.removeItem(`salt_${userId}`);
  },
};

/**
 * Key management utilities
 */
export const KeyManager = {
  /**
   * Initialize encryption for a new user
   * Generates a salt and derives the encryption key
   */
  async initializeForUser(
    userId: number,
    password: string
  ): Promise<CryptoKey> {
    const salt = generateSalt();
    SaltStorage.saveSalt(userId, salt);
    return deriveKey(password, salt);
  },

  /**
   * Get encryption key for an existing user
   */
  async getKeyForUser(userId: number, password: string): Promise<CryptoKey> {
    const salt = SaltStorage.getSalt(userId);
    if (!salt) {
      throw new Error('Encryption salt not found. User may need to re-register.');
    }
    return deriveKey(password, salt);
  },

  /**
   * Clear encryption data for a user (on logout)
   */
  clearUserData(userId: number): void {
    SaltStorage.removeSalt(userId);
  },
};
