import type { FunctionReturnType } from "convex/server";

import type { api } from "@convex/_generated/api";

export type MyPoule = FunctionReturnType<typeof api.poules.listMine>[number];
export type StandingRow = FunctionReturnType<
  typeof api.poules.standings
>[number];

/** "🏆 Kantoorpoule": emoji en naam, voor in de navigatiebalk. */
export function pouleTitle(poule: { name: string; emoji: string | null }) {
  return [poule.emoji, poule.name].filter(Boolean).join(" ");
}

/** "4 leden · 3 evenementen" */
export function pouleSummary(memberCount: number, eventCount: number): string {
  const members = memberCount === 1 ? "1 lid" : `${memberCount} leden`;
  const events = eventCount === 1 ? "1 evenement" : `${eventCount} evenementen`;

  return `${members} · ${events}`;
}

/** "Mees Egberts" → "Mees", voor onder een podiumtrede. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** "2× exact · 5 gescoord" */
export function standingSubtitle(row: StandingRow): string {
  return `${row.exact}× exact · ${row.predicted} gescoord`;
}

export type PouleDetail = FunctionReturnType<typeof api.poules.get>;
export type PouleMember = FunctionReturnType<typeof api.poules.members>[number];
