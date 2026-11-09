import { useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type {
  BracketGroupOrder,
  BracketPayload,
  BracketValue,
} from "@modules/fixture-types/bracket";
import {
  emptyBracketValue,
  groupOrderOf,
  pickWinner,
  setGroupOrder,
} from "@modules/fixture-types/bracket-tree";

import { sameOrder } from "@/utils/bracket-groups";

const SAVE_DELAY = 700;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Options {
  fixtureId: Id<"fixtures">;
  payload: BracketPayload;
  saved: BracketValue | null;
  /** Volgorde per groep volgens je voorspelde uitslagen. */
  defaults: BracketGroupOrder[];
  isLocked: boolean;
}

/** Groepen die (nog) automatisch je voorspelde uitslagen volgen. */
function initialAutoGroups(
  saved: BracketValue | null,
  defaults: BracketGroupOrder[],
) {
  const auto = new Set<string>();

  for (const entry of defaults) {
    const savedOrder = saved ? groupOrderOf(saved, entry.group) : null;

    if (savedOrder === null || sameOrder(savedOrder, entry.order)) {
      auto.add(entry.group);
    }
  }

  return auto;
}

function withDefaults(
  payload: BracketPayload,
  value: BracketValue,
  defaults: BracketGroupOrder[],
  autoGroups: Set<string>,
): BracketValue {
  let next = value;

  for (const entry of defaults) {
    const current = groupOrderOf(next, entry.group);
    const shouldFollow = autoGroups.has(entry.group) || current === null;

    if (shouldFollow && !sameOrder(current, entry.order)) {
      next = setGroupOrder(payload, next, entry.group, entry.order);
    }
  }

  return next;
}

/**
 * Lokaal concept van het knock-outschema met automatisch opslaan. Groepen
 * volgen je voorspelde uitslagen, tot je een groep zelf op volgorde zet.
 */
export function useBracketDraft({
  fixtureId,
  payload,
  saved,
  defaults,
  isLocked,
}: Options) {
  const save = useMutation(api.predictions.save);
  const [autoGroups, setAutoGroups] = useState(() =>
    initialAutoGroups(saved, defaults),
  );
  const [base, setBase] = useState<BracketValue>(saved ?? emptyBracketValue);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pending = useRef<BracketValue | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScheduled = useRef<BracketValue | null>(null);

  // Groepen die automatisch volgen, schuiven mee met je voorspelde uitslagen.
  const draft = useMemo(
    () => withDefaults(payload, base, defaults, autoGroups),
    [payload, base, defaults, autoGroups],
  );

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    const value = pending.current;
    pending.current = null;

    if (!value) {
      return;
    }

    setStatus("saving");

    try {
      await save({ fixtureId, payload: value });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [save, fixtureId]);

  const schedule = useCallback(
    (next: BracketValue) => {
      if (isLocked) {
        return;
      }

      lastScheduled.current = next;
      pending.current = next;

      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(flush, SAVE_DELAY);
    },
    [isLocked, flush],
  );

  const commit = useCallback(
    (next: BracketValue) => {
      setBase(next);
      schedule(next);
    },
    [schedule],
  );

  // Schuift een automatische groep mee terwijl je al winnaars hebt gekozen,
  // dan bewaren we het bijgewerkte schema ook.
  useEffect(() => {
    const isDerivedChange = draft !== base && draft !== lastScheduled.current;

    if (isDerivedChange && draft.winners.length > 0) {
      schedule(draft);
    }
  }, [draft, base, schedule]);

  // Bij het verlaten van het scherm nog openstaande wijzigingen bewaren.
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  const chooseWinner = useCallback(
    (matchId: string, teamId: string) => {
      commit(pickWinner(payload, draft, matchId, teamId));
    },
    [commit, payload, draft],
  );

  /** Nieuwe volgorde na slepen; de groep volgt daarna niet meer automatisch. */
  const reorderGroup = useCallback(
    (groupKey: string, next: string[]) => {
      setAutoGroups((current) => {
        const updated = new Set(current);
        updated.delete(groupKey);
        return updated;
      });
      commit(setGroupOrder(payload, draft, groupKey, next));
    },
    [commit, payload, draft],
  );

  return { draft, status, chooseWinner, reorderGroup };
}
