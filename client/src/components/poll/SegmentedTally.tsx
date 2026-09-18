/**
 * One tick per voter, filled ticks for the leader's votes — never a
 * full-width bar, which lies about a landslide at small n (guidance/
 * brand-kit.md "Data Viz Rules" #1). aria-hidden: the numbers live in the
 * text beside it, not here.
 */
export function SegmentedTally({ totalVotes, filledCount }: { totalVotes: number; filledCount: number }) {
  return (
    <div aria-hidden="true" className="flex flex-wrap gap-1">
      {Array.from({ length: totalVotes }, (_, i) => (
        <span
          key={i}
          className={`h-4 w-2 rounded-[length:var(--radius-sm)] transition-colors duration-300 ${i < filledCount ? "bg-butter" : "bg-tangerine-deep"}`}
        />
      ))}
    </div>
  );
}
