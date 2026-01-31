import { describe, it, expect } from "vitest";
import {
  generateModuleSchedule,
  resolveModuleStatuses,
  calculateProjectedDays,
  validateCommitment,
  MAX_ENROLLMENT_DAYS,
  type ModuleScheduleEntry,
} from "./schedule";

// ── generateModuleSchedule ────────────────────────────────────────────────

describe("generateModuleSchedule", () => {
  const modules = [
    { id: "m1", module_index: 1 },
    { id: "m2", module_index: 2 },
    { id: "m3", module_index: 3 },
    { id: "m4", module_index: 4 },
    { id: "m5", module_index: 5 },
  ];

  it("generates correct dates for a 3-day cadence", () => {
    const schedule = generateModuleSchedule(modules, "2026-01-15", 3);

    expect(schedule).toHaveLength(5);
    expect(schedule[0]).toEqual({
      moduleId: "m1",
      moduleIndex: 1,
      unlockDate: "2026-01-15",
      dueDate: "2026-01-17",
    });
    expect(schedule[1]).toEqual({
      moduleId: "m2",
      moduleIndex: 2,
      unlockDate: "2026-01-18",
      dueDate: "2026-01-20",
    });
    expect(schedule[2]).toEqual({
      moduleId: "m3",
      moduleIndex: 3,
      unlockDate: "2026-01-21",
      dueDate: "2026-01-23",
    });
    expect(schedule[3]).toEqual({
      moduleId: "m4",
      moduleIndex: 4,
      unlockDate: "2026-01-24",
      dueDate: "2026-01-26",
    });
    expect(schedule[4]).toEqual({
      moduleId: "m5",
      moduleIndex: 5,
      unlockDate: "2026-01-27",
      dueDate: "2026-01-29",
    });
  });

  it("generates correct dates for a 1-day cadence", () => {
    const schedule = generateModuleSchedule(modules.slice(0, 3), "2026-02-01", 1);

    expect(schedule).toHaveLength(3);
    expect(schedule[0].unlockDate).toBe("2026-02-01");
    expect(schedule[0].dueDate).toBe("2026-02-01");
    expect(schedule[1].unlockDate).toBe("2026-02-02");
    expect(schedule[1].dueDate).toBe("2026-02-02");
    expect(schedule[2].unlockDate).toBe("2026-02-03");
    expect(schedule[2].dueDate).toBe("2026-02-03");
  });

  it("generates correct dates for a 7-day cadence", () => {
    const schedule = generateModuleSchedule(modules.slice(0, 3), "2026-03-01", 7);

    expect(schedule[0].unlockDate).toBe("2026-03-01");
    expect(schedule[0].dueDate).toBe("2026-03-07");
    expect(schedule[1].unlockDate).toBe("2026-03-08");
    expect(schedule[1].dueDate).toBe("2026-03-14");
    expect(schedule[2].unlockDate).toBe("2026-03-15");
    expect(schedule[2].dueDate).toBe("2026-03-21");
  });

  it("handles empty modules array", () => {
    const schedule = generateModuleSchedule([], "2026-01-01", 3);
    expect(schedule).toEqual([]);
  });

  it("handles single module", () => {
    const schedule = generateModuleSchedule([{ id: "m1", module_index: 1 }], "2026-01-10", 5);

    expect(schedule).toHaveLength(1);
    expect(schedule[0]).toEqual({
      moduleId: "m1",
      moduleIndex: 1,
      unlockDate: "2026-01-10",
      dueDate: "2026-01-14",
    });
  });

  it("throws for intervalDays < 1", () => {
    expect(() => generateModuleSchedule(modules, "2026-01-01", 0)).toThrow(
      "intervalDays must be at least 1"
    );
    expect(() => generateModuleSchedule(modules, "2026-01-01", -1)).toThrow(
      "intervalDays must be at least 1"
    );
  });

  it("handles month boundaries correctly", () => {
    const schedule = generateModuleSchedule(
      [{ id: "m1", module_index: 1 }, { id: "m2", module_index: 2 }],
      "2026-01-30",
      3
    );

    expect(schedule[0].unlockDate).toBe("2026-01-30");
    expect(schedule[0].dueDate).toBe("2026-02-01");
    expect(schedule[1].unlockDate).toBe("2026-02-02");
    expect(schedule[1].dueDate).toBe("2026-02-04");
  });

  it("handles year boundaries correctly", () => {
    const schedule = generateModuleSchedule(
      [{ id: "m1", module_index: 1 }, { id: "m2", module_index: 2 }],
      "2026-12-30",
      3
    );

    expect(schedule[0].unlockDate).toBe("2026-12-30");
    expect(schedule[1].unlockDate).toBe("2027-01-02");
  });
});

// ── resolveModuleStatuses ─────────────────────────────────────────────────

describe("resolveModuleStatuses", () => {
  function makeSchedule(
    count: number,
    startDate: string,
    intervalDays: number
  ): ModuleScheduleEntry[] {
    const modules = Array.from({ length: count }, (_, i) => ({
      id: `m${i + 1}`,
      module_index: i + 1,
    }));
    return generateModuleSchedule(modules, startDate, intervalDays);
  }

  it("first module is CURRENT, second is NEXT_PREVIEW, rest are LOCKED on enrollment day", () => {
    const schedule = makeSchedule(5, "2026-01-15", 3);
    const result = resolveModuleStatuses(schedule, "2026-01-15");

    expect(result[0].status).toBe("CURRENT");
    expect(result[1].status).toBe("NEXT_PREVIEW");
    expect(result[2].status).toBe("LOCKED");
    expect(result[3].status).toBe("LOCKED");
    expect(result[4].status).toBe("LOCKED");
  });

  it("after first interval, second module becomes CURRENT, third is NEXT_PREVIEW", () => {
    const schedule = makeSchedule(5, "2026-01-15", 3);
    // After 3 days, module 2 unlocks on 2026-01-18
    const result = resolveModuleStatuses(schedule, "2026-01-18");

    expect(result[0].status).toBe("CURRENT"); // still accessible
    expect(result[1].status).toBe("CURRENT"); // newly unlocked (latest CURRENT)
    expect(result[2].status).toBe("NEXT_PREVIEW");
    expect(result[3].status).toBe("LOCKED");
    expect(result[4].status).toBe("LOCKED");
  });

  it("all modules become CURRENT when all unlock dates have passed", () => {
    const schedule = makeSchedule(3, "2026-01-01", 3);
    // All modules unlocked by 2026-01-07
    const result = resolveModuleStatuses(schedule, "2026-02-01");

    expect(result[0].status).toBe("CURRENT");
    expect(result[1].status).toBe("CURRENT");
    expect(result[2].status).toBe("CURRENT");
  });

  it("handles empty schedule", () => {
    const result = resolveModuleStatuses([], "2026-01-01");
    expect(result).toEqual([]);
  });

  it("handles single module — always CURRENT", () => {
    const schedule = makeSchedule(1, "2026-01-01", 3);
    const result = resolveModuleStatuses(schedule, "2026-01-01");

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("CURRENT");
  });

  it("handles two modules on enrollment day", () => {
    const schedule = makeSchedule(2, "2026-01-01", 3);
    const result = resolveModuleStatuses(schedule, "2026-01-01");

    expect(result[0].status).toBe("CURRENT");
    expect(result[1].status).toBe("NEXT_PREVIEW");
  });

  it("handles two modules after both are unlocked", () => {
    const schedule = makeSchedule(2, "2026-01-01", 3);
    const result = resolveModuleStatuses(schedule, "2026-01-04");

    expect(result[0].status).toBe("CURRENT");
    expect(result[1].status).toBe("CURRENT");
  });

  it("preserves moduleId and dates in results", () => {
    const schedule = makeSchedule(3, "2026-01-10", 5);
    const result = resolveModuleStatuses(schedule, "2026-01-10");

    expect(result[0].moduleId).toBe("m1");
    expect(result[0].unlockDate).toBe("2026-01-10");
    expect(result[0].dueDate).toBe("2026-01-14");
    expect(result[1].moduleId).toBe("m2");
    expect(result[1].unlockDate).toBe("2026-01-15");
    expect(result[2].moduleId).toBe("m3");
    expect(result[2].unlockDate).toBe("2026-01-20");
  });

  it("day before unlock date keeps module LOCKED", () => {
    const schedule = makeSchedule(3, "2026-01-10", 5);
    // Module 2 unlocks on 2026-01-15, check the day before
    const result = resolveModuleStatuses(schedule, "2026-01-14");

    expect(result[0].status).toBe("CURRENT");
    expect(result[1].status).toBe("NEXT_PREVIEW");
    expect(result[2].status).toBe("LOCKED");
  });

  it("on exact unlock date, module becomes CURRENT", () => {
    const schedule = makeSchedule(3, "2026-01-10", 5);
    // Module 2 unlocks on 2026-01-15
    const result = resolveModuleStatuses(schedule, "2026-01-15");

    expect(result[0].status).toBe("CURRENT");
    expect(result[1].status).toBe("CURRENT");
    expect(result[2].status).toBe("NEXT_PREVIEW");
  });

  it("correctly handles 1-day cadence progression", () => {
    const schedule = makeSchedule(4, "2026-06-01", 1);

    // Day 1
    let result = resolveModuleStatuses(schedule, "2026-06-01");
    expect(result.map((r) => r.status)).toEqual([
      "CURRENT",
      "NEXT_PREVIEW",
      "LOCKED",
      "LOCKED",
    ]);

    // Day 2
    result = resolveModuleStatuses(schedule, "2026-06-02");
    expect(result.map((r) => r.status)).toEqual([
      "CURRENT",
      "CURRENT",
      "NEXT_PREVIEW",
      "LOCKED",
    ]);

    // Day 3
    result = resolveModuleStatuses(schedule, "2026-06-03");
    expect(result.map((r) => r.status)).toEqual([
      "CURRENT",
      "CURRENT",
      "CURRENT",
      "NEXT_PREVIEW",
    ]);

    // Day 4
    result = resolveModuleStatuses(schedule, "2026-06-04");
    expect(result.map((r) => r.status)).toEqual([
      "CURRENT",
      "CURRENT",
      "CURRENT",
      "CURRENT",
    ]);
  });
});

// ── calculateProjectedDays ────────────────────────────────────────────────

describe("calculateProjectedDays", () => {
  it("calculates days as stepCount * intervalDays", () => {
    expect(calculateProjectedDays(10, 3)).toBe(30);
    expect(calculateProjectedDays(5, 7)).toBe(35);
    expect(calculateProjectedDays(365, 1)).toBe(365);
  });

  it("returns 0 for zero or negative steps", () => {
    expect(calculateProjectedDays(0, 3)).toBe(0);
    expect(calculateProjectedDays(-1, 3)).toBe(0);
  });

  it("returns 0 for intervalDays < 1", () => {
    expect(calculateProjectedDays(10, 0)).toBe(0);
    expect(calculateProjectedDays(10, -1)).toBe(0);
  });

  it("handles single step", () => {
    expect(calculateProjectedDays(1, 30)).toBe(30);
    expect(calculateProjectedDays(1, 1)).toBe(1);
  });

  it("handles large step counts", () => {
    expect(calculateProjectedDays(500, 1)).toBe(500);
    expect(calculateProjectedDays(100, 30)).toBe(3000);
  });
});

// ── validateCommitment ────────────────────────────────────────────────────

describe("validateCommitment", () => {
  it("allows commitment that fits within 365 days", () => {
    // 50 steps * 7 days = 350 days
    const result = validateCommitment(50, 7);
    expect(result.valid).toBe(true);
    expect(result.projectedDays).toBe(350);
    expect(result.suggestedIntervalDays).toBeNull();
  });

  it("allows exactly 365 days (boundary)", () => {
    // 365 steps * 1 day = 365 days
    const result = validateCommitment(365, 1);
    expect(result.valid).toBe(true);
    expect(result.projectedDays).toBe(365);
  });

  it("rejects 366 days (just over boundary)", () => {
    // 366 steps * 1 day = 366 days
    const result = validateCommitment(366, 1);
    expect(result.valid).toBe(false);
    expect(result.projectedDays).toBe(366);
    expect(result.suggestedIntervalDays).toBeNull(); // even daily doesn't fit
  });

  it("rejects commitment exceeding 365 days with suggestion", () => {
    // 20 steps * 30 days = 600 days
    const result = validateCommitment(20, 30);
    expect(result.valid).toBe(false);
    expect(result.projectedDays).toBe(600);
    // 365 / 20 = 18.25 -> floor to 18
    expect(result.suggestedIntervalDays).toBe(18);
  });

  it("suggests null when even daily commitment exceeds limit", () => {
    // 400 steps * 1 day = 400 days
    const result = validateCommitment(400, 1);
    expect(result.valid).toBe(false);
    expect(result.suggestedIntervalDays).toBeNull();
  });

  it("calculates projectedYears correctly", () => {
    // 12 steps * 30 days = 360 days -> 1.0 years
    const result1 = validateCommitment(12, 30);
    expect(result1.projectedYears).toBe(1);

    // 20 steps * 30 days = 600 days -> 1.6 years
    const result2 = validateCommitment(20, 30);
    expect(result2.projectedYears).toBe(1.6);

    // 40 steps * 30 days = 1200 days -> 3.3 years
    const result3 = validateCommitment(40, 30);
    expect(result3.projectedYears).toBe(3.3);
  });

  it("handles trivial case of 1 step", () => {
    // 1 step * 30 = 30 days — always valid
    const result = validateCommitment(1, 30);
    expect(result.valid).toBe(true);
    expect(result.projectedDays).toBe(30);
  });

  it("handles zero steps", () => {
    const result = validateCommitment(0, 7);
    expect(result.valid).toBe(true);
    expect(result.projectedDays).toBe(0);
  });

  it("validates common cadence options for a 50-step course", () => {
    // Daily: 50 * 1 = 50 ✓
    expect(validateCommitment(50, 1).valid).toBe(true);
    // Every 3 days: 50 * 3 = 150 ✓
    expect(validateCommitment(50, 3).valid).toBe(true);
    // Weekly: 50 * 7 = 350 ✓
    expect(validateCommitment(50, 7).valid).toBe(true);
    // Biweekly: 50 * 14 = 700 ✗
    expect(validateCommitment(50, 14).valid).toBe(false);
    // Monthly: 50 * 30 = 1500 ✗
    expect(validateCommitment(50, 30).valid).toBe(false);
  });

  it("uses MAX_ENROLLMENT_DAYS constant (365)", () => {
    expect(MAX_ENROLLMENT_DAYS).toBe(365);
  });
});
