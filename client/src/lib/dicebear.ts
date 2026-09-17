import type { Avatar, AvatarTint } from "@tiebreak/shared";

/** guidance/brand-kit.md — the four DiceBear "micah" background tints. */
export const AVATAR_TINTS: AvatarTint[] = ["f8c9b9", "cbe2d8", "f6e0a4", "e3d2f2"];

/** The same four tints as Tailwind background classes — one map, used by both the avatar fallback and the tint picker. */
export const AVATAR_TINT_BG_CLASS: Record<AvatarTint, string> = {
  f8c9b9: "bg-tint-peach",
  cbe2d8: "bg-tint-teal-soft",
  f6e0a4: "bg-tint-butter-soft",
  e3d2f2: "bg-tint-lilac",
};

/** Hosted, keyless path (spec/technical-requirements.md "Avatars (DiceBear)"). */
export function avatarUrl(avatar: Avatar): string {
  const seed = encodeURIComponent(avatar.seed);
  return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=${avatar.tint}`;
}

export function randomTint(): AvatarTint {
  return AVATAR_TINTS[Math.floor(Math.random() * AVATAR_TINTS.length)];
}
