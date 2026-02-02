/**
 * Format a date string (YYYY-MM-DD) into a localized short date.
 * Treats the input as a UTC date to avoid timezone shifts.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Determine the urgency status of a due date relative to today.
 * - "overdue": past due
 * - "soon": due within 2 days
 * - "normal": due later
 * - "none": no due date provided
 */
export function getDueStatus(dueDate: string | null): "overdue" | "soon" | "normal" | "none" {
  if (!dueDate) return "none";
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return "overdue";
  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const soonStr = soon.toISOString().slice(0, 10);
  if (dueDate <= soonStr) return "soon";
  return "normal";
}
