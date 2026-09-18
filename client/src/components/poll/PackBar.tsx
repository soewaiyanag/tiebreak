/** Width is relative to the leader's votes, not to 100% — answers "how far behind?" not "what share?" */
export function PackBar({ widthPercent }: { widthPercent: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-[length:var(--radius-full)] bg-cream-deep">
      <div
        className="h-full rounded-[length:var(--radius-full)] bg-teal transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  );
}
