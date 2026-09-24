/** Mirrors client/src/lib/api/guest-selectors.ts's slugify exactly, so a poll's shareable link looks the same whether it came from guest mode or the real backend. */
export class Slug {
  static generate(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    return `${base || "poll"}-${Math.random().toString(36).slice(2, 6)}`;
  }
}
