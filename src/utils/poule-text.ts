import type { Doc } from "@convex/_generated/dataModel";

/** Rollabel achter een lid; gewone leden krijgen geen label. */
export function roleLabel(
  role: Doc<"pouleMembers">["role"],
): string | undefined {
  if (role === "owner") {
    return "Eigenaar";
  }

  if (role === "admin") {
    return "Beheerder";
  }

  return undefined;
}
