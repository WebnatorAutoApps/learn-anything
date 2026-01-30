import { describe, it, expect } from "vitest";
import {
  generateModuleSchedule,
  resolveModuleStatuses,
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
