export function isValidDateOnly(value: string): boolean {
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** "2026-10-08" -> Date at UTC midnight (matches Postgres DATE columns) */
export const parseDateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

/** Date -> "2026-10-08" */
export const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

export function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}