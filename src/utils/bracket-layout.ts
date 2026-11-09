/** Maten van de bracket. Alle posities volgen uit deze getallen. */
export const TEAM_ROW_HEIGHT = 42;
export const MATCH_HEIGHT = TEAM_ROW_HEIGHT * 2 + 1;
export const SLOT_HEIGHT = MATCH_HEIGHT + 22;
export const CONNECTOR_WIDTH = 28;
export const ROUND_HEADER_HEIGHT = 32;

/** Rijhoogte in de sleepbare groepsvolgorde (Android). */
export const GROUP_ROW_HEIGHT = 50;

/**
 * Maten van de native groepslijst op iOS: een rij met landcode is 52 pt
 * (gemeten in de simulator), de kop met sectietitel ongeveer 56 pt.
 */
const GROUP_LIST_HEADER_HEIGHT = 56;
const GROUP_LIST_ROW_HEIGHT = 52;

/** Kolombreedte: de volgende ronde piept rechts in beeld, zodat je ziet dat je kunt swipen. */
export function columnWidth(screenWidth: number): number {
  return Math.min(240, Math.round(screenWidth * 0.62));
}

/**
 * Bovenkant van wedstrijd `matchIndex` in ronde `roundIndex`. Elke ronde
 * staat precies tussen de twee wedstrijden die hem voeden.
 */
export function matchTop(roundIndex: number, matchIndex: number): number {
  const span = 2 ** roundIndex;
  const slotCenter =
    (span * matchIndex + (span - 1) / 2) * SLOT_HEIGHT + SLOT_HEIGHT / 2;

  return slotCenter - MATCH_HEIGHT / 2;
}

export function matchCenter(roundIndex: number, matchIndex: number): number {
  return matchTop(roundIndex, matchIndex) + MATCH_HEIGHT / 2;
}

export function boardHeight(firstRoundMatches: number): number {
  return Math.max(firstRoundMatches, 1) * SLOT_HEIGHT;
}

export function groupListHeight(rows: number): number {
  return GROUP_LIST_HEADER_HEIGHT + rows * GROUP_LIST_ROW_HEIGHT;
}
