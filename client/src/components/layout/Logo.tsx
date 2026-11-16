const BAR_DELAYS_S = [0.15, 0.3];
const SLASH_DELAY_S = 0.6;
const SLASH_PATH = "M12 24.2L20 5.6";

/**
 * The mark is the name: an equals sign is a tie, and the tangerine slash
 * breaks it. It sits on a game tile like every other pressable piece.
 * `animated` draws it once on mount (the landing page): the two bars, then
 * the slash landing. Keyframes are in globals.css.
 */
export function Logo({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={animated ? "logo-animated overflow-visible" : "overflow-visible"}
      >
        <rect x="2.2" y="4.6" width="27.6" height="25.2" rx="7.5" fill="var(--color-cocoa)" />
        <g className="logo-face">
          <rect
            x="2.2"
            y="2.2"
            width="27.6"
            height="25.2"
            rx="7.5"
            fill="var(--color-cream-bright)"
            stroke="var(--color-cocoa)"
            strokeWidth="2.4"
          />
          {["M9 11.4h14", "M9 18.4h14"].map((d, i) => (
            <path
              key={d}
              className="logo-stroke"
              pathLength={1}
              style={{ animationDelay: `${BAR_DELAYS_S[i]}s` }}
              d={d}
              fill="none"
              stroke="var(--color-cocoa)"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          ))}
          {/* The slash twice: a cocoa outline under the tangerine, so it reads as inked on top of the bars. */}
          {[
            { stroke: "var(--color-cocoa)", width: 6.2 },
            { stroke: "var(--color-tangerine)", width: 3.2 },
          ].map(({ stroke, width }) => (
            <path
              key={stroke}
              className="logo-stroke"
              pathLength={1}
              style={{ animationDelay: `${SLASH_DELAY_S}s` }}
              d={SLASH_PATH}
              fill="none"
              stroke={stroke}
              strokeWidth={width}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
      <span className="font-display text-md font-black text-cocoa">tiebreak</span>
    </span>
  );
}
