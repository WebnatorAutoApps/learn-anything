import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const HEX_KEY_LENGTH = 64; // 64 hex chars = 32 bytes
const KEY_BYTE_LENGTH = 32; // AES-256 requires 32-byte key

/**
 * Validates the GEMINI_KEY_ENCRYPTION_SECRET env var and returns a list of
 * issues. Returns an empty array if valid.
 */
export function validateEncryptionConfig(): string[] {
  const errors: string[] = [];
  const secret = process.env.GEMINI_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    errors.push(
      "GEMINI_KEY_ENCRYPTION_SECRET environment variable is not set. " +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
    return errors;
  }

  if (secret.length !== HEX_KEY_LENGTH) {
    errors.push(
      `GEMINI_KEY_ENCRYPTION_SECRET must be exactly ${HEX_KEY_LENGTH} hex characters (got ${secret.length})`
    );
  }

  if (!/^[0-9a-fA-F]+$/.test(secret)) {
    errors.push(
      "GEMINI_KEY_ENCRYPTION_SECRET contains non-hex characters — it must be a hex-encoded string"
    );
  }

  if (errors.length === 0) {
    const key = Buffer.from(secret, "hex");
    if (key.length !== KEY_BYTE_LENGTH) {
      errors.push(
        `GEMINI_KEY_ENCRYPTION_SECRET decoded to ${key.length} bytes, but ${KEY_BYTE_LENGTH} bytes are required`
      );
    }
  }

  return errors;
}

function getEncryptionKey(): Buffer {
  const errors = validateEncryptionConfig();
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
  return Buffer.from(process.env.GEMINI_KEY_ENCRYPTION_SECRET!, "hex");
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
