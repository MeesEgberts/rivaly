import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { successFeedback, tapFeedback } from "@/utils/haptics";
import { showError } from "@/utils/error-message";

import {
  cellIndex,
  cellsOf,
  differsFromSaved,
  isComplete,
} from "@/utils/score-entry-cells";
import {
  EMPTY_DRAFT,
  type EditableMatch,
  type ScoreCell,
  type ScoreDraft,
} from "@/types/score-entry";

/**
 * Invoerstatus voor een lijst wedstrijden: welk vak actief is, wat er lokaal
 * is ingetikt, en automatisch opslaan zodra beide scores van een wedstrijd
 * bekend zijn.
 */
export function useScoreEntryState(matches: EditableMatch[]) {
  const save = useMutation(api.predictions.save);
  const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>({});
  const [activeCell, setActiveCell] = useState<ScoreCell | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());

  const cells = useMemo(() => cellsOf(matches), [matches]);

  const matchById = useMemo(
    () => new Map(matches.map((match) => [match.fixtureId, match])),
    [matches],
  );

  const activeMatch = activeCell
    ? (matchById.get(activeCell.fixtureId) ?? null)
    : null;

  const valueOf = useCallback(
    (fixtureId: string): ScoreDraft => {
      const draft = drafts[fixtureId];

      if (draft) {
        return draft;
      }

      return matchById.get(fixtureId)?.saved ?? EMPTY_DRAFT;
    },
    [drafts, matchById],
  );

  const isSaving = useCallback(
    (fixtureId: string) => savingIds.has(fixtureId),
    [savingIds],
  );

  const persist = useCallback(
    async (fixtureId: string, draft: { home: number; away: number }) => {
      setSavingIds((current) => new Set(current).add(fixtureId));

      try {
        await save({
          fixtureId: fixtureId as Id<"fixtures">,
          payload: { type: "score", home: draft.home, away: draft.away },
        });
        successFeedback();
      } catch (error) {
        showError("Opslaan mislukt", error);
      } finally {
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(fixtureId);
          return next;
        });
      }
    },
    [save],
  );

  const moveBy = useCallback(
    (offset: number) => {
      const index = cellIndex(cells, activeCell);
      const next = cells[index + offset];

      setActiveCell(next ?? null);
    },
    [cells, activeCell],
  );

  const enterDigit = useCallback(
    (digit: number) => {
      if (!activeCell) {
        return;
      }

      tapFeedback();

      const current = valueOf(activeCell.fixtureId);
      const draft = { ...current, [activeCell.side]: digit };

      setDrafts((all) => ({ ...all, [activeCell.fixtureId]: draft }));

      const saved = matchById.get(activeCell.fixtureId)?.saved ?? null;

      if (isComplete(draft) && differsFromSaved(draft, saved)) {
        persist(activeCell.fixtureId, draft);
      }

      moveBy(1);
    },
    [activeCell, valueOf, matchById, persist, moveBy],
  );

  const clearActive = useCallback(() => {
    if (!activeCell) {
      return;
    }

    tapFeedback();

    const current = valueOf(activeCell.fixtureId);

    if (current[activeCell.side] === null) {
      moveBy(-1);
      return;
    }

    setDrafts((all) => ({
      ...all,
      [activeCell.fixtureId]: { ...current, [activeCell.side]: null },
    }));
  }, [activeCell, valueOf, moveBy]);

  const selectCell = useCallback((cell: ScoreCell) => {
    tapFeedback();
    setActiveCell(cell);
  }, []);

  const dismiss = useCallback(() => setActiveCell(null), []);

  return {
    activeCell,
    activeMatch,
    valueOf,
    isSaving,
    selectCell,
    enterDigit,
    clearActive,
    next: () => moveBy(1),
    previous: () => moveBy(-1),
    dismiss,
  };
}

export type ScoreEntryState = ReturnType<typeof useScoreEntryState>;
