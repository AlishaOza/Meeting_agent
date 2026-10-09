import type { ActionItem } from "../types/meeting";

/** Local date as YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function localDateString(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isOverdue(a: ActionItem): boolean {
  return !!a.dueDate && a.status !== "Completed" && a.dueDate < localDateString();
}