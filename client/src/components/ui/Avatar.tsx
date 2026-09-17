import { useState } from "react";
import type { Avatar as AvatarType } from "@tiebreak/shared";
import { AVATAR_TINT_BG_CLASS, avatarUrl } from "../../lib/dicebear";
import { cn } from "../../lib/cn";

interface AvatarProps {
  avatar: AvatarType;
  size: 20 | 24 | 34 | 40 | 50;
  /** Pass "" when a visible name sits right next to the avatar (guidance/accessibility.md). */
  alt: string;
  className?: string;
}

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
        className={cn(shared, AVATAR_TINT_BG_CLASS[avatar.tint])}
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
