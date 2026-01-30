import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { encrypt, decrypt, extractLast4, validateEncryptionConfig } from "./crypto";
import { randomBytes } from "crypto";

// A valid 64-char hex key for testing
const VALID_KEY = randomBytes(32).toString("hex");

function withEnv(key: string, value: string | undefined, fn: () => void) {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

describe("validateEncryptionConfig", () => {
  it("returns errors when env var is missing", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", undefined, () => {
      const errors = validateEncryptionConfig();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("not set");
    });
  });

  it("returns errors when env var is empty", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", "", () => {
      const errors = validateEncryptionConfig();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("not set");
    });
  });

  it("returns errors when key is wrong length", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", "abcdef1234", () => {
      const errors = validateEncryptionConfig();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("64 hex characters");
    });
  });

  it("returns errors when key contains non-hex characters", () => {
    const badKey = "g".repeat(64);
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", badKey, () => {
      const errors = validateEncryptionConfig();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("non-hex");
    });
  });

  it("returns empty array for valid key", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", VALID_KEY, () => {
      const errors = validateEncryptionConfig();
      expect(errors).toEqual([]);
    });
  });

  it("accepts a valid key with trailing whitespace", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", VALID_KEY + "  \n", () => {
      const errors = validateEncryptionConfig();
      expect(errors).toEqual([]);
    });
  });

  it("accepts a valid key with leading whitespace", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", "  " + VALID_KEY, () => {
      const errors = validateEncryptionConfig();
      expect(errors).toEqual([]);
    });
  });

  it("treats whitespace-only value as not set", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", "  \n  ", () => {
      const errors = validateEncryptionConfig();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("not set");
    });
  });
});

describe("encrypt / decrypt round-trip", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.GEMINI_KEY_ENCRYPTION_SECRET;
    process.env.GEMINI_KEY_ENCRYPTION_SECRET = VALID_KEY;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.GEMINI_KEY_ENCRYPTION_SECRET;
    } else {
      process.env.GEMINI_KEY_ENCRYPTION_SECRET = originalEnv;
    }
  });

  it("encrypts and decrypts a simple string", () => {
    const plaintext = "AIzaSyTestKey12345";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("encrypts and decrypts an empty string", () => {
    const encrypted = encrypt("");
    expect(decrypt(encrypted)).toBe("");
  });

  it("encrypts and decrypts a string with special characters", () => {
    const plaintext = "key-with=special/chars+and==padding";
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("encrypts and decrypts unicode content", () => {
    const plaintext = "key-with-emoji-🔑-and-日本語";
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    const plaintext = "AIzaSyTestKey12345";
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);
    expect(encrypted1).not.toBe(encrypted2);
    // Both should decrypt to the same value
    expect(decrypt(encrypted1)).toBe(plaintext);
    expect(decrypt(encrypted2)).toBe(plaintext);
  });

  it("encrypted output has three colon-separated parts", () => {
    const encrypted = encrypt("test");
    const parts = encrypted.split(":");
    expect(parts.length).toBe(3);
  });

  it("encrypts and decrypts when env var has trailing whitespace", () => {
    const originalEnvValue = process.env.GEMINI_KEY_ENCRYPTION_SECRET;
    process.env.GEMINI_KEY_ENCRYPTION_SECRET = VALID_KEY + "  \n";
    try {
      const plaintext = "AIzaSyTestKey12345";
      const encrypted = encrypt(plaintext);
      expect(decrypt(encrypted)).toBe(plaintext);
    } finally {
      process.env.GEMINI_KEY_ENCRYPTION_SECRET = originalEnvValue;
    }
  });
});

describe("encrypt error handling", () => {
  it("throws when env var is missing", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", undefined, () => {
      expect(() => encrypt("test")).toThrow("not set");
    });
  });

  it("throws when key is wrong length", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", "aabb", () => {
      expect(() => encrypt("test")).toThrow("64 hex characters");
    });
  });
});

describe("decrypt error handling", () => {
  it("throws when env var is missing", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", undefined, () => {
      expect(() => decrypt("a:b:c")).toThrow("not set");
    });
  });

  it("throws on invalid format (missing parts)", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", VALID_KEY, () => {
      expect(() => decrypt("invalidciphertext")).toThrow("Invalid encrypted value format");
    });
  });

  it("throws on corrupt ciphertext", () => {
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", VALID_KEY, () => {
      expect(() => decrypt("AAAA:BBBB:CCCC")).toThrow();
    });
  });

  it("throws when decrypting with wrong key", () => {
    let encrypted: string;
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", VALID_KEY, () => {
      encrypted = encrypt("test-secret");
    });
    const otherKey = randomBytes(32).toString("hex");
    withEnv("GEMINI_KEY_ENCRYPTION_SECRET", otherKey, () => {
      expect(() => decrypt(encrypted!)).toThrow();
    });
  });
});

describe("extractLast4", () => {
  it("returns last 4 characters for long keys", () => {
    expect(extractLast4("AIzaSyTestKey12345")).toBe("2345");
  });

  it("returns entire string for short keys", () => {
    expect(extractLast4("ab")).toBe("ab");
  });

  it("returns entire string when exactly 4 characters", () => {
    expect(extractLast4("abcd")).toBe("abcd");
  });

  it("returns last 4 for 5 character string", () => {
    expect(extractLast4("abcde")).toBe("bcde");
  });
});
