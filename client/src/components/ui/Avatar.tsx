import { useState } from "react";
import type { Avatar as AvatarType } from "@tiebreak/shared";
import { avatarUrl } from "../../lib/dicebear";
import { cn } from "../../lib/cn";

interface AvatarProps {
  avatar: AvatarType;
  size: 20 | 24 | 34 | 40 | 50;
  /** Pass "" when a visible name sits right next to the avatar (guidance/accessibility.md). */
  alt: string;
  className?: string;
}

const TINT_BG: Record<AvatarType["tint"], string> = {
  f8c9b9: "bg-tint-peach",
  cbe2d8: "bg-tint-teal-soft",
  f6e0a4: "bg-tint-butter-soft",
  e3d2f2: "bg-tint-lilac",
};

/** DiceBear avatar with a tinted-circle fallback on load failure — never a silent gap. */
export function Avatar({ avatar, size, alt, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const shared = cn(
    "inline-block shrink-0 rounded-full border-cocoa",
    size >= 34 ? "border-[length:var(--border-card)]" : "border-[length:var(--border-chip)]",
    className,
  );

  if (failed) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn(shared, TINT_BG[avatar.tint])}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={avatarUrl(avatar)}
      alt={alt}
      width={size}
      height={size}
      className={shared}
      onError={() => setFailed(true)}
    />
  );
}
