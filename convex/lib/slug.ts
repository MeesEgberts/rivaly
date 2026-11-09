import type { MutationCtx } from "../_generated/server";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Een slug die nog niet bestaat: de basis, anders met een volgnummer erachter. */
export async function uniqueSlug(
  ctx: MutationCtx,
  base: string,
): Promise<string> {
  const baseSlug = slugify(base) || "evenement";
  let slug = baseSlug;

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${attempt}`;
  }

  return `${baseSlug}-${Date.now()}`;
}
