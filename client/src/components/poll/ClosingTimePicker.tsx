import { forwardRef, useEffect, useId, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { FieldError } from "../ui/FormField";
import { InkChip } from "../ui/InkChip";
import { StatusSticker } from "./StatusSticker";
import { useNow } from "../../hooks/useNow";
import { cn } from "../../lib/cn";
import {
  atTime,
  clampFuture,
  parseLocalValue,
  quickPicks,
  startOfDay,
  to12Hour,
  to24Hour,
  toLocalValue,
  type Meridiem,
} from "../../lib/closing-time";

interface ClosingTimePickerProps {
  legend: string;
  /** "YYYY-MM-DDTHH:mm" in local time, or "" — the same shape <input type="datetime-local"> used. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MONTHS_AHEAD = 12;
const DEFAULT_HOUR_24 = 12;
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const MERIDIEMS: Meridiem[] = ["AM", "PM"];

const pad = (n: number) => String(n).padStart(2, "0");

const NAV_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-full text-cocoa hover:bg-cream-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal disabled:opacity-30 disabled:hover:bg-transparent";

/** The calendar, dressed in the app's tokens: day buttons are round pieces, the picked day is inked in. */
const CALENDAR_CLASSES = {
  root: "w-full",
  months: "relative",
  month: "w-full",
  month_caption: "flex h-10 items-center justify-center font-display text-md font-black text-cocoa",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous: NAV_BUTTON,
  button_next: NAV_BUTTON,
  chevron: "fill-cocoa",
  month_grid: "mt-2 w-full border-separate border-spacing-y-0.5",
  weekday: "pb-1 text-center font-body text-xs font-bold text-cocoa-soft",
  day: "p-0 text-center",
  day_button:
    "mx-auto flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums text-cocoa enabled:hover:bg-cream-deep focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal disabled:cursor-not-allowed",
  selected:
    "[&>button]:bg-cocoa [&>button]:text-cream-bright [&>button]:hover:bg-cocoa [&>button]:animate-[check-in_0.18s_var(--ease-out)] motion-reduce:[&>button]:animate-none",
  today: "[&>button]:ring-2 [&>button]:ring-inset [&>button]:ring-cocoa-soft",
  disabled: "[&>button]:opacity-35",
  outside: "invisible",
};

interface WheelItem {
  value: number;
  label: string;
  disabled: boolean;
}

/**
 * A scrollable column of choices with the picked one centred and inked in.
 * Scroll to browse, tap to pick, or use the arrow keys. Not a native select:
 * every row is styled, and a long list (60 minutes) stays one thumb-flick.
 */
function Wheel({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: WheelItem[];
  value: number | null;
  onChange: (value: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const id = useId();

  // Keeps the picked row centred. The first paint jumps there; later picks glide, unless motion is reduced.
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !row) return;
    const smooth = !firstRender.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    firstRender.current = false;
    list.scrollTo({
      top: row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, [value]);

  function step(direction: 1 | -1) {
    const open = items.filter((item) => !item.disabled);
    const at = open.findIndex((item) => item.value === value);
    const next = open[at === -1 ? (direction === 1 ? 0 : open.length - 1) : at + direction];
    if (next) onChange(next.value);
  }

  return (
    <div className="flex-1">
      <p className="mb-1 text-center font-body text-xs font-bold text-cocoa-soft">{label}</p>
      <div
        ref={listRef}
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={value === null ? undefined : `${id}-${value}`}
        onKeyDown={(e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
          e.preventDefault();
          step(e.key === "ArrowDown" ? 1 : -1);
        }}
        className="relative h-[220px] snap-y snap-proximity overflow-y-auto overscroll-contain rounded-[length:var(--radius-md)] border-2 border-cocoa-soft bg-card py-[88px] [mask-image:linear-gradient(transparent,black_22%,black_78%,transparent)] [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-teal [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const picked = item.value === value;
          return (
            <div
              key={item.value}
              id={`${id}-${item.value}`}
              role="option"
              aria-selected={picked}
              aria-disabled={item.disabled || undefined}
              onClick={() => !item.disabled && onChange(item.value)}
              className={cn(
                "mx-1.5 flex h-11 snap-center items-center justify-center rounded-full font-display text-base font-bold tabular-nums transition-colors duration-150",
                picked ? "bg-cocoa text-cream-bright" : "text-cocoa",
                !picked && !item.disabled && "cursor-pointer hover:bg-cream-deep",
                item.disabled && "cursor-not-allowed opacity-35",
              )}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The closing-time field, in place of the browser's date-time input:
 * one-tap quick picks for the usual cases, then a calendar for any day in
 * the next year and scrolling wheels for any hour and minute. The preview
 * is the exact sticker voters will see, so "is that long enough?" gets
 * answered as you pick. The ref lands on the first quick pick, for focusing
 * on a validation error.
 */
export const ClosingTimePicker = forwardRef<HTMLButtonElement, ClosingTimePickerProps>(function ClosingTimePicker(
  { legend, value, onChange, error },
  firstRef,
) {
  const now = useNow();
  const errorId = useId();
  const picked = parseLocalValue(value);
  const today = startOfDay(now);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD, 1);

  // Every control builds on what's picked so far, or noon, so the first tap anywhere gives a complete time.
  const base = picked ?? atTime(today, DEFAULT_HOUR_24, 0);
  const day = startOfDay(base);
  const { hour, meridiem } = to12Hour(base.getHours());
  const isPast = (d: Date) => d.getTime() <= now.getTime();
  const commit = (d: Date) => onChange(toLocalValue(clampFuture(d, now)));

  const hourItems: WheelItem[] = HOURS_12.map((h) => ({
    value: h,
    label: String(h),
    disabled: isPast(atTime(day, to24Hour(h, meridiem), 59)),
  }));
  const minuteItems: WheelItem[] = MINUTES.map((m) => ({
    value: m,
    label: pad(m),
    disabled: isPast(atTime(day, base.getHours(), m)),
  }));

  return (
    // min-w-0: fieldsets default to min-width: min-content, which would stretch to fit the widest child.
    <fieldset aria-describedby={error ? errorId : undefined} className="min-w-0">
      <legend className="font-body text-sm font-bold text-cocoa">{legend}</legend>

      <div className="mt-2 flex flex-wrap gap-2">
        {quickPicks(now).map((pick, i) => (
          <InkChip
            key={pick.label}
            ref={i === 0 ? firstRef : undefined}
            picked={value === pick.value}
            onClick={() => onChange(pick.value)}
            layout="flex items-center justify-center px-4 py-2"
            className="rounded-full text-sm"
          >
            {pick.label}
          </InkChip>
        ))}
      </div>

      <p className="mt-5 font-body text-sm font-bold text-cocoa">Or pick a day and time</p>
      {/* A container query, not a screen one: the same picker sits in the wide form and the narrow Reopen modal. */}
      <div className="@container mt-2">
        <div className="grid gap-4 @md:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="rounded-[length:var(--radius-md)] border-2 border-cocoa-soft bg-card p-3">
            <DayPicker
              // Remounting on a new month follows quick picks into that month; picks inside it keep focus.
              key={picked ? `${picked.getFullYear()}-${picked.getMonth()}` : "none"}
              mode="single"
              required
              selected={picked ? day : undefined}
              onSelect={(d) => commit(atTime(d, base.getHours(), base.getMinutes()))}
              defaultMonth={picked ?? today}
              startMonth={today}
              endMonth={lastMonth}
              disabled={{ before: today }}
              classNames={CALENDAR_CLASSES}
            />
          </div>

          <div className="flex gap-2">
            <Wheel
              label="Hour"
              items={hourItems}
              value={picked ? hour : null}
              onChange={(h) => commit(atTime(day, to24Hour(h, meridiem), base.getMinutes()))}
            />
            <Wheel
              label="Minute"
              items={minuteItems}
              value={picked ? base.getMinutes() : null}
              onChange={(m) => commit(atTime(day, base.getHours(), m))}
            />
            <div className="flex flex-col justify-center gap-2 pt-5">
              {MERIDIEMS.map((m) => (
                <InkChip
                  key={m}
                  picked={Boolean(picked) && meridiem === m}
                  disabled={isPast(atTime(day, m === "AM" ? 11 : 23, 59))}
                  onClick={() => commit(atTime(day, to24Hour(hour, m), base.getMinutes()))}
                  layout="flex items-center justify-center"
                  className="h-11 w-12 rounded-full text-sm"
                >
                  {m}
                </InkChip>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2 font-body text-sm text-cocoa-soft">
        {picked ? (
          <>
            Voters will see
            <span key={value} className="animate-[check-in_0.18s_var(--ease-out)] motion-reduce:animate-none">
              <StatusSticker state="open" closesAt={picked.toISOString()} />
            </span>
          </>
        ) : (
          "Pick a time and you'll see what voters see."
        )}
      </div>

      {error && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
});
