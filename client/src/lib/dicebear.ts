import type { Avatar, AvatarTint } from "@tiebreak/shared";

/** guidance/brand-kit.md — the four DiceBear "micah" background tints. */
export const AVATAR_TINTS: AvatarTint[] = ["f8c9b9", "cbe2d8", "f6e0a4", "e3d2f2"];

/** Hosted, keyless path (spec/technical-requirements.md "Avatars (DiceBear)"). */
export function avatarUrl(avatar: Avatar): string {
  const seed = encodeURIComponent(avatar.seed);
  return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=${avatar.tint}`;
}

export function randomTint(): AvatarTint {
  return AVATAR_TINTS[Math.floor(Math.random() * AVATAR_TINTS.length)];
}
