import { describe, it, expect } from "vitest";
import { normalizeName, generateHexSuffix, generateUsername } from "./username";

describe("normalizeName", () => {
  it("lowercases and strips spaces", () => {
    expect(normalizeName("John Doe")).toBe("john-doe");
  });

  it("replaces multiple spaces with a single hyphen", () => {
    expect(normalizeName("John   Doe")).toBe("john-doe");
  });

  it("strips special characters", () => {
    expect(normalizeName("Jane! @O'Brien#")).toBe("jane-obrien");
  });

  it("handles unicode/emoji names by stripping non-ASCII", () => {
    expect(normalizeName("José García")).toBe("jos-garca");
  });

  it("returns 'user' for null input", () => {
    expect(normalizeName(null)).toBe("user");
  });

  it("returns 'user' for undefined input", () => {
    expect(normalizeName(undefined)).toBe("user");
  });

  it("returns 'user' for empty string", () => {
    expect(normalizeName("")).toBe("user");
  });

  it("returns 'user' for whitespace-only string", () => {
    expect(normalizeName("   ")).toBe("user");
  });

  it("returns 'user' for string of only special characters", () => {
    expect(normalizeName("!!!@@@###")).toBe("user");
  });

  it("collapses consecutive hyphens", () => {
    expect(normalizeName("a - - b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(normalizeName("-hello-")).toBe("hello");
  });

  it("handles numeric names", () => {
    expect(normalizeName("123")).toBe("123");
  });

  it("handles mixed alphanumeric names", () => {
    expect(normalizeName("User 123 Test")).toBe("user-123-test");
  });
});

describe("generateHexSuffix", () => {
  it("returns a 5-character string", () => {
    const suffix = generateHexSuffix();
    expect(suffix).toHaveLength(5);
  });

  it("returns only hexadecimal characters", () => {
    const suffix = generateHexSuffix();
    expect(suffix).toMatch(/^[0-9a-f]{5}$/);
  });

  it("generates different values on subsequent calls", () => {
    const suffixes = new Set(Array.from({ length: 20 }, () => generateHexSuffix()));
    // With 20 attempts, we should get multiple unique values
    expect(suffixes.size).toBeGreaterThan(1);
  });
});

describe("generateUsername", () => {
  it("matches the expected format: name-XXXXX", () => {
    const username = generateUsername("John Doe");
    expect(username).toMatch(/^john-doe-[0-9a-f]{5}$/);
  });

  it("uses 'user' prefix for null name", () => {
    const username = generateUsername(null);
    expect(username).toMatch(/^user-[0-9a-f]{5}$/);
  });

  it("uses 'user' prefix for empty name", () => {
    const username = generateUsername("");
    expect(username).toMatch(/^user-[0-9a-f]{5}$/);
  });

  it("handles special characters in name", () => {
    const username = generateUsername("Jane! O'Brien");
    expect(username).toMatch(/^jane-obrien-[0-9a-f]{5}$/);
  });

  it("matches the full regex pattern for valid usernames", () => {
    const names = ["John", "Jane Doe", null, "", "  ", "ABC 123", "special!@#chars"];
    for (const name of names) {
      const username = generateUsername(name);
      expect(username).toMatch(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?-[0-9a-f]{5}$/);
    }
  });
});

describe("collision/retry simulation", () => {
  it("generates unique usernames across many attempts", () => {
    const seen = new Set<string>();
    const attempts = 100;

    for (let i = 0; i < attempts; i++) {
      const username = generateUsername("test");
      seen.add(username);
    }

    // With 5 hex chars (1,048,576 combinations), 100 attempts should all be unique
    expect(seen.size).toBe(attempts);
  });

  it("retry logic can find unique username when simulating collisions in a Set", () => {
    const existing = new Set<string>();
    const maxRetries = 10;

    // Pre-generate some usernames to simulate existing records
    for (let i = 0; i < 5; i++) {
      existing.add(generateUsername("test"));
    }

    // Simulate retry logic: generate a username that doesn't conflict
    let candidate = "";
    let found = false;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      candidate = generateUsername("test");
      if (!existing.has(candidate)) {
        found = true;
        break;
      }
    }

    expect(found).toBe(true);
    expect(candidate).toMatch(/^test-[0-9a-f]{5}$/);
  });
});
