import { ConvexError } from "convex/values";

import type { MutationCtx } from "../_generated/server";

// Geen 0/O, 1/I: codes worden hardop voorgelezen en overgetypt.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LENGTH = 6;

function randomCode(): string {
  let code = "";

  for (let i = 0; i < LENGTH; i += 1) {
    const index = Math.floor(Math.random() * ALPHABET.length);
    code += ALPHABET[index];
  }

  return code;
}

/** Normaliseert gebruikersinvoer zoals "riv-7k3q ma" naar "7K3QMA". */
export function normalizeInviteCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/^RIV-?/, "")
    .replace(/[^A-Z0-9]/g, "");
}

export async function generateUniqueInviteCode(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomCode();

    const existing = await ctx.db
      .query("poules")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", code))
      .unique();

    if (!existing) {
      return code;
    }
  }

  throw new ConvexError("Kon geen unieke uitnodigingscode maken. Probeer het opnieuw.");
}
