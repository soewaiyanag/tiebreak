import { cn } from "../../lib/cn";

/** Sized to the real content so nothing shifts when data lands (guidance/patterns.md). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[length:var(--radius-md)] bg-cream-deep", className)} />;
}
