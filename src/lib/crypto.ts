import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

function getEncryptionKey(): Buffer {
  const secret = process.env.GEMINI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error(
      "GEMINI_KEY_ENCRYPTION_SECRET environment variable is not set"
    );
  }
  // The secret must be exactly 32 bytes (256 bits) hex-encoded (64 hex chars)
  const key = Buffer.from(secret, "hex");
  if (key.length !== 32) {
    throw new Error(
      "GEMINI_KEY_ENCRYPTION_SECRET must be a 64-character hex string (32 bytes)"
    );
  }
  return key;
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a string in the format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/**
 * Decrypts a ciphertext string produced by encrypt().
 * Expects format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value format");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = Buffer.from(parts[2], "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Extracts the last 4 characters of a key for display purposes.
 * If the key is shorter than 4 characters, returns the entire key.
 */
export function extractLast4(key: string): string {
  return key.length <= 4 ? key : key.slice(-4);
}
