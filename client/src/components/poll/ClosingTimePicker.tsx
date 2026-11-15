import { forwardRef, useId, useState } from "react";
import { InkChip } from "../ui/InkChip";
import { FieldError } from "../ui/FormField";
import { StatusSticker } from "./StatusSticker";
import { useNow } from "../../hooks/useNow";
import { addDays, atTime, parseLocalValue, quickPicks, startOfDay, toLocalValue } from "../../lib/closing-time";

interface ClosingTimePickerProps {
  legend: string;
  /** "YYYY-MM-DDTHH:mm" in local time, or "" — the same shape <input type="datetime-local"> used. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// shortcut: only the next 14 days and 6 AM–11 PM are pickable; polls here close in hours or days. Widen if groups need later dates or overnight closes.
const DAYS_AHEAD = 14;
const HOUR_ROWS = [
  { label: "Morning", hours: [6, 7, 8, 9, 10, 11] },
  { label: "Afternoon", hours: [12, 13, 14, 15, 16, 17] },
  { label: "Evening", hours: [18, 19, 20, 21, 22, 23] },
];
const MINUTES = [0, 15, 30, 45];

const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const monthName = new Intl.DateTimeFormat(undefined, { month: "short" });
const fullDay = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
const hourName = new Intl.DateTimeFormat(undefined, { hour: "numeric" });

/**
 * The closing-time field, in place of the browser's date-time input:
 * one-tap quick picks for the usual cases, then a day strip, an hour grid
 * and minute chips for anything else. The preview is the exact sticker
 * voters will see, so "is that long enough?" gets answered as you pick.
 * The ref lands on the first quick pick, for focusing on a validation error.
 */
export const ClosingTimePicker = forwardRef<HTMLButtonElement, ClosingTimePickerProps>(function ClosingTimePicker(
  { legend, value, onChange, error },
  firstRef,
) {
  const now = useNow();
  const errorId = useId();
  const picked = parseLocalValue(value);
  const today = startOfDay(now);
  // The day you're browsing before you've picked an hour; once a time is picked, the value decides.
  const [browsingDay, setBrowsingDay] = useState(today);
  const day = picked ? startOfDay(picked) : browsingDay;
  const isPast = (d: Date) => d.getTime() <= now.getTime();

  function pickDay(d: Date) {
    if (picked) onChange(toLocalValue(atTime(d, picked.getHours(), picked.getMinutes())));
    else setBrowsingDay(d);
  }

  return (
    // min-w-0: fieldsets default to min-width: min-content, which would stretch to fit the whole day strip.
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

      <p className="mt-5 font-body text-sm font-bold text-cocoa">Or pick a day</p>
      {/* Scrolls sideways on narrow screens; py/px leave room for the piece edge and focus ring. */}
      <div className="-mx-1 mt-2 flex snap-x gap-2 overflow-x-auto px-1 pb-2 pt-1">
        {Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i)).map((d, i) => {
          const isPicked = d.getTime() === day.getTime();
          return (
            <InkChip
              key={d.toISOString()}
              picked={isPicked}
              aria-label={i === 0 ? `Today, ${fullDay.format(d)}` : fullDay.format(d)}
              onClick={() => pickDay(d)}
              layout="flex flex-col items-center justify-center py-2"
              className="w-16 shrink-0 snap-start rounded-[length:var(--radius-md)]"
            >
              <span className="font-body text-xs font-bold text-cocoa-soft">
                {i === 0 ? "Today" : weekday.format(d)}
              </span>
              <span className="text-xl leading-none tabular-nums">{d.getDate()}</span>
              <span className="font-body text-xs text-cocoa-soft">{monthName.format(d)}</span>
            </InkChip>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {HOUR_ROWS.map((row) => (
          <div key={row.label} className="sm:flex sm:items-center sm:gap-3">
            <span className="mb-1 block font-body text-sm text-cocoa-soft sm:mb-0 sm:w-20 sm:shrink-0">
              {row.label}
            </span>
            <div className="grid flex-1 grid-cols-6 gap-1.5">
              {row.hours.map((h) => {
                const isPicked = picked?.getHours() === h;
                // An hour is gone once even its last quarter has passed.
                const gone = isPast(atTime(day, h, 45));
                return (
                  <InkChip
                    key={h}
                    picked={isPicked}
                    aria-label={hourName.format(atTime(day, h, 0))}
                    disabled={gone}
                    onClick={() => {
                      const minute = picked?.getMinutes() ?? 0;
                      // Keep the minute if it's still ahead; otherwise jump to this hour's first quarter that is.
                      const firstOpen = MINUTES.find((m) => !isPast(atTime(day, h, m))) ?? 0;
                      onChange(toLocalValue(atTime(day, h, isPast(atTime(day, h, minute)) ? firstOpen : minute)));
                    }}
                    layout="flex items-center justify-center"
                    className="h-11 rounded-full text-sm tabular-nums"
                  >
                    {h % 12 === 0 ? 12 : h % 12}
                  </InkChip>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 sm:flex sm:items-center sm:gap-3">
        <span className="mb-1 block font-body text-sm text-cocoa-soft sm:mb-0 sm:w-20 sm:shrink-0">Minutes</span>
        <div className="grid flex-1 grid-cols-4 gap-1.5 sm:flex-none sm:basis-[calc((100%-5.75rem)*4/6)]">
          {MINUTES.map((m) => {
            const isPicked = picked?.getMinutes() === m;
            return (
              <InkChip
                key={m}
                picked={isPicked}
                aria-label={`${m} minutes past`}
                disabled={!picked || isPast(atTime(day, picked.getHours(), m))}
                onClick={() => picked && onChange(toLocalValue(atTime(day, picked.getHours(), m)))}
                layout="flex items-center justify-center"
                className="h-11 rounded-full text-sm tabular-nums"
              >
                :{String(m).padStart(2, "0")}
              </InkChip>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex min-h-9 items-center gap-3 font-body text-sm text-cocoa-soft">
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
