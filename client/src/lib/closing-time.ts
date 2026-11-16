/**
 * Pure helpers behind ClosingTimePicker. Values stay in the shape the old
 * <input type="datetime-local"> produced ("YYYY-MM-DDTHH:mm", local time),
 * so the forms' validation and toISOString() calls didn't have to change.
 */

const pad = (n: number) => String(n).padStart(2, "0");

export function toLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseLocalValue(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function atTime(day: Date, hour: number, minute: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
}

export function addDays(day: Date, n: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + n);
}

/** Rounded up to the next quarter hour, so every quick pick lands on a minute chip the picker can show. */
export function roundUpToQuarter(d: Date): Date {
  const r = new Date(d);
  r.setSeconds(0, 0);
  const extra = (15 - (r.getMinutes() % 15)) % 15;
  r.setMinutes(r.getMinutes() + extra);
  return r;
}

export interface QuickPick {
  label: string;
  value: string;
}

/** The closing times groups actually reach for: polls here are decided in hours, not weeks. */
export function quickPicks(now: Date): QuickPick[] {
  const today = startOfDay(now);
  const picks: QuickPick[] = [
    { label: "In an hour", value: toLocalValue(roundUpToQuarter(new Date(now.getTime() + 60 * 60_000))) },
    { label: "In 3 hours", value: toLocalValue(roundUpToQuarter(new Date(now.getTime() + 3 * 60 * 60_000))) },
  ];
  // "Tonight" only while there's still an evening left to vote in.
  if (now.getHours() < 19) picks.push({ label: "Tonight, 8 PM", value: toLocalValue(atTime(today, 20, 0)) });
  picks.push({ label: "Tomorrow, noon", value: toLocalValue(atTime(addDays(today, 1), 12, 0)) });
  return picks;
}

export type Meridiem = "AM" | "PM";

export function to24Hour(hour12: number, meridiem: Meridiem): number {
  return (hour12 % 12) + (meridiem === "PM" ? 12 : 0);
}

export function to12Hour(hour24: number): { hour: number; meridiem: Meridiem } {
  return { hour: hour24 % 12 === 0 ? 12 : hour24 % 12, meridiem: hour24 >= 12 ? "PM" : "AM" };
}

/** A time that has already passed becomes the next quarter hour, so a poll can never be created closed. */
export function clampFuture(d: Date, now: Date): Date {
  const MS_PER_MINUTE = 60_000;
  return d.getTime() > now.getTime() ? d : roundUpToQuarter(new Date(now.getTime() + MS_PER_MINUTE));
}
