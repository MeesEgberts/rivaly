import type {
  BracketPayload,
  BracketSlotSource,
} from "@modules/fixture-types/bracket";

/** "Kwartfinale 2" per wedstrijd-id, voor lege plekken ("Winnaar kwartfinale 2"). */
export function matchLabels(payload: BracketPayload): Map<string, string> {
  const labels = new Map<string, string>();

  for (const round of payload.rounds) {
    round.matches.forEach((match, index) => {
      const suffix = round.matches.length > 1 ? ` ${index + 1}` : "";
      labels.set(match.id, `${round.name.toLowerCase()}${suffix}`);
    });
  }

  return labels;
}

/** Tekst voor een plek waar nog geen team staat. */
export function slotPlaceholder(
  source: BracketSlotSource,
  labels: Map<string, string>,
): string {
  if (source.kind === "group") {
    return `${source.position}e groep ${source.group}`;
  }

  return `Winnaar ${labels.get(source.matchId) ?? "vorige ronde"}`;
}
