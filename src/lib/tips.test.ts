import { describe, it, expect, beforeEach, vi } from "vitest";
import { pickRandomTip, tips, type Tip } from "./tips";

// Mock sessionStorage
const store: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(store)) delete store[key];
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn(() => null),
};

Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

describe("tips config", () => {
  it("exports a non-empty tips array", () => {
    expect(Array.isArray(tips)).toBe(true);
    expect(tips.length).toBeGreaterThan(0);
  });

  it("each tip has the required fields", () => {
    for (const tip of tips) {
      expect(tip.id).toBeTruthy();
      expect(typeof tip.message).toBe("string");
      expect(typeof tip.ctaLabel).toBe("string");
      expect(tip.ctaAction).toBeDefined();
      expect(["settings", "route"]).toContain(tip.ctaAction.type);
    }
  });

  it("tip ids are unique", () => {
    const ids = tips.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("pickRandomTip", () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns null for empty pool", () => {
    expect(pickRandomTip([])).toBeNull();
  });

  it("returns the only tip when pool has one item", () => {
    const pool: Tip[] = [
      {
        id: "only",
        message: "Only tip",
        ctaLabel: "Go",
        ctaAction: { type: "route", path: "/test" },
      },
    ];
    expect(pickRandomTip(pool)).toEqual(pool[0]);
  });

  it("returns a tip from the pool", () => {
    const result = pickRandomTip(tips);
    expect(result).not.toBeNull();
    expect(tips.some((t) => t.id === result!.id)).toBe(true);
  });

  it("stores the selected tip id in sessionStorage", () => {
    const result = pickRandomTip(tips);
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      "learn-anything-last-tip-id",
      result!.id
    );
  });

  it("avoids the last-shown tip when possible", () => {
    const pool: Tip[] = [
      {
        id: "a",
        message: "Tip A",
        ctaLabel: "Go A",
        ctaAction: { type: "route", path: "/a" },
      },
      {
        id: "b",
        message: "Tip B",
        ctaLabel: "Go B",
        ctaAction: { type: "route", path: "/b" },
      },
    ];

    // Simulate "a" as the last shown tip
    store["learn-anything-last-tip-id"] = "a";

    // With only 2 tips and "a" excluded, must always pick "b"
    const result = pickRandomTip(pool);
    expect(result!.id).toBe("b");
  });

  it("falls back to full pool if all tips were last shown", () => {
    const pool: Tip[] = [
      {
        id: "solo",
        message: "Solo",
        ctaLabel: "Go",
        ctaAction: { type: "route", path: "/solo" },
      },
    ];

    store["learn-anything-last-tip-id"] = "solo";
    // Single-item pool returns the item regardless of last-shown
    const result = pickRandomTip(pool);
    expect(result!.id).toBe("solo");
  });

  it("handles sessionStorage errors gracefully", () => {
    sessionStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error("Access denied");
    });

    // Should not throw
    const result = pickRandomTip(tips);
    expect(result).not.toBeNull();
  });
});
