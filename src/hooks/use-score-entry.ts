import { createContext, useContext } from "react";
import type { HostInstance } from "react-native";

import type { ScoreEntryState } from "@/hooks/use-score-entry-state";

export interface ScoreEntryContextValue extends ScoreEntryState {
  /** Rijen melden zich aan, zodat het actieve vak in beeld gescrold kan worden. */
  registerRow: (fixtureId: string, view: HostInstance | null) => void;
}

export const ScoreEntryContext = createContext<ScoreEntryContextValue | null>(
  null,
);

export function useScoreEntry(): ScoreEntryContextValue {
  const value = useContext(ScoreEntryContext);

  if (!value) {
    throw new Error("useScoreEntry hoort binnen een ScoreEntryScrollView.");
  }

  return value;
}
