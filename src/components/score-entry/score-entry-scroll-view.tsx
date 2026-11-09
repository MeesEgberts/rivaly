import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  StyleSheet,
  View,
  type HostInstance,
  type ScrollViewInstance,
} from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { useEventScroll } from "@/hooks/use-event-scroll";

import {
  ScoreEntryContext,
  type ScoreEntryContextValue,
} from "@/hooks/use-score-entry";
import type { EditableMatch } from "@/types/score-entry";
import { ScoreKeypad } from "./score-keypad";
import { useKeepRowVisible } from "@/hooks/use-keep-row-visible";
import { useScoreEntryState } from "@/hooks/use-score-entry-state";

interface Props {
  /** Alle wedstrijden die op dit scherm ingevuld kunnen worden, in volgorde. */
  matches: EditableMatch[];
  children: ReactNode;
}

/**
 * Scrollende lijst met snelle score-invoer: tik een vak, tik cijfers, en
 * het cijferblok loopt vanzelf door alle wedstrijden. Rijen binnen deze view
 * gebruiken `useScoreEntry()`. Bovenaan staat de kop van het evenement.
 */
export function ScoreEntryScrollView({ matches, children }: Props) {
  const colors = useAppColors();
  const entry = useScoreEntryState(matches);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const rows = useRef(new Map<string, HostInstance>());
  const [keypadHeight, setKeypadHeight] = useState(0);

  const isEditing = entry.activeCell !== null;
  const bottomSpace = isEditing ? keypadHeight + 24 : 32;

  const { onScroll, keepVisible } = useKeepRowVisible(scrollRef, keypadHeight);
  const {
    header,
    scrollRef: registerScroll,
    scrollProps,
  } = useEventScroll(onScroll);

  // Zelf scrollen (rij in beeld houden) én het scherm laten verschuiven.
  const setScrollView = useCallback(
    (node: ScrollViewInstance | null) => {
      scrollRef.current = node;
      registerScroll(node);
    },
    [registerScroll],
  );

  const registerRow = useCallback(
    (fixtureId: string, view: HostInstance | null) => {
      if (view) {
        rows.current.set(fixtureId, view);
      } else {
        rows.current.delete(fixtureId);
      }
    },
    [],
  );

  const activeFixtureId = entry.activeCell?.fixtureId ?? null;

  useEffect(() => {
    if (activeFixtureId === null) {
      return;
    }

    const row = rows.current.get(activeFixtureId);

    if (row) {
      keepVisible(row);
    }
  }, [activeFixtureId, keepVisible, keypadHeight]);

  const contextValue = useMemo<ScoreEntryContextValue>(
    () => ({ ...entry, registerRow }),
    [entry, registerRow],
  );

  return (
    <ScoreEntryContext.Provider value={contextValue}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.ScrollView
          ref={setScrollView}
          {...scrollProps}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: bottomSpace }}
        >
          {header}
          {children}
        </Animated.ScrollView>

        {isEditing ? (
          <ScoreKeypad
            title={entry.activeMatch?.label ?? ""}
            onDigit={entry.enterDigit}
            onClear={entry.clearActive}
            onPrevious={entry.previous}
            onNext={entry.next}
            onDone={entry.dismiss}
            onLayoutHeight={setKeypadHeight}
          />
        ) : null}
      </View>
    </ScoreEntryContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
