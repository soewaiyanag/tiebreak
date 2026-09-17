/**
 * Closing times are stored as UTC and always displayed in the viewer's local
 * time (spec/technical-requirements.md: "'Closes today at 7:00 PM' means
 * *their* 7:00 PM"). No date library — Intl covers everything this UI needs.
 */

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const monthDayFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function formatClosingTime(closesAt: string, now: Date = new Date()): string {
  const closes = new Date(closesAt);
  const time = timeFormatter.format(closes);

  if (isSameDay(closes, now)) return `today at ${time}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(closes, tomorrow)) return `tomorrow at ${time}`;

  const withinAWeek = closes.getTime() - now.getTime() < 6 * 24 * 60 * 60 * 1000;
  if (withinAWeek && closes.getTime() > now.getTime()) {
    return `${weekdayFormatter.format(closes)} at ${time}`;
  }

  return `${monthDayFormatter.format(closes)} at ${time}`;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.round(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return weekdayFormatter.format(then);
}
