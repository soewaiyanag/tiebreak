import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[length:var(--radius-lg)] border-[length:var(--border-card)] border-cocoa bg-card p-6", className)}
      {...props}
    />
  );
}
