import { router, Stack, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { EventHero, PHOTO_HEIGHT } from "@/components/event/event-hero";
import { EventTabContent } from "@/components/event/event-tab-content";
import { EventTabPicker } from "@/components/event/event-tab-picker";
import { EventBodySkeleton } from "@/components/skeleton/event-body-skeleton";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import {
  EventScrollContext,
  type EventScrollValue,
} from "@/hooks/use-event-scroll";
import { parsePreview } from "@/utils/event-preview";
import { tabSwitchOffset } from "@/utils/event-tab-offset";
import { eventTabs, type EventTabKey } from "@/utils/event-tabs";

/** Hoe ver de naam onder de foto staat: daarna komt de titel in de balk. */
const NAME_OFFSET = 70;

/** Zo lang schuift het segment door voordat de inhoud wisselt. */
const SEGMENT_SLIDE_MS = 180;

/**
 * Een evenement invullen en volgen. Bovenaan een kop zoals Apple Kaarten
 * (foto, beeldmerk, naam en de tabs) die meescrollt met de inhoud; zodra de
 * naam onder de navigatiebalk verdwijnt, verschijnt hij daar als titel.
 *
 * Een bezochte tab blijft bestaan, zodat terugwisselen direct is en hij zijn
 * plek houdt. Bij een wissel schuift eerst het segment door; daarna komt de
 * nieuwe tab op dezelfde hoogte in beeld, zodat de tabs niet verspringen.
 */
export default function EventScreen() {
  const {
    eventId,
    tab: initialTab,
    preview: previewParam,
  } = useLocalSearchParams<{
    eventId: Id<"events">;
    tab?: EventTabKey;
    preview?: string;
  }>();
  const preview = useMemo(() => parsePreview(previewParam), [previewParam]);
  const colors = useAppColors();
  const headerHeight = useHeaderHeight();
  const { event, fixtures, isLoading } = useEventData(eventId);

  // Wat het segment toont, en welke tab er in beeld is (iets later).
  const [pickedTab, setPickedTab] = useState<EventTabKey | null>(
    initialTab ?? null,
  );
  const [shownTab, setShownTab] = useState<EventTabKey | null>(
    initialTab ?? null,
  );
  const [visitedTabs, setVisitedTabs] = useState<EventTabKey[]>([]);
  const [initialOffsets, setInitialOffsets] = useState<
    Partial<Record<EventTabKey, number>>
  >({});
  const [isTitleShown, setIsTitleShown] = useState(false);
  const [tabsY, setTabsY] = useState(0);
  // Eén waarde voor de hele levensduur van het scherm.
  const [scrollY] = useState(() => new Animated.Value(0));

  const offsets = useRef(new Map<EventTabKey, number>());
  const scrollViews = useRef(new Map<EventTabKey, ScrollViewInstance>());
  const activeTabRef = useRef<EventTabKey | null>(null);
  const thresholdRef = useRef(0);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tabs = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return eventTabs(event.stages, fixtures);
  }, [event, fixtures]);

  const resolve = (key: EventTabKey | null) =>
    tabs.find((tab) => tab.key === key)?.key ?? tabs[0]?.key ?? null;
  const activeTab = resolve(shownTab);
  const segmentTab = resolve(pickedTab);

  const titleThreshold = (event?.imageUrl ? PHOTO_HEIGHT : 0) + NAME_OFFSET;

  useEffect(() => {
    activeTabRef.current = activeTab;
    thresholdRef.current = titleThreshold;
  }, [activeTab, titleThreshold]);

  useEffect(
    () => () => {
      if (switchTimer.current) {
        clearTimeout(switchTimer.current);
      }
    },
    [],
  );

  // Per tab vaste functies, zodat de lijsten hun scroll-koppeling houden.
  const tabHandlers = useMemo(
    () =>
      new Map(
        tabs.map((tab) => [
          tab.key,
          {
            onOffset: (y: number) => {
              offsets.current.set(tab.key, y);

              if (activeTabRef.current !== tab.key) {
                return;
              }

              const shown = y > thresholdRef.current;
              setIsTitleShown((current) =>
                current === shown ? current : shown,
              );
            },
            registerScroll: (node: ScrollViewInstance | null) => {
              if (node) {
                scrollViews.current.set(tab.key, node);
              } else {
                scrollViews.current.delete(tab.key);
              }
            },
          },
        ]),
      ),
    [tabs],
  );

  const showTab = useCallback(
    (next: EventTabKey, from: EventTabKey) => {
      const target = tabSwitchOffset({
        fromY: offsets.current.get(from) ?? 0,
        ownY: offsets.current.get(next),
        limit: Math.max(0, tabsY - headerHeight),
      });

      offsets.current.set(next, target);
      scrollY.setValue(target);
      setIsTitleShown(target > thresholdRef.current);

      const existing = scrollViews.current.get(next);

      if (existing) {
        existing.scrollTo({ y: target, animated: false });
      } else {
        setInitialOffsets((current) => ({ ...current, [next]: target }));
      }

      // De tab die je verlaat blijft bestaan; de nieuwe staat er al in.
      setVisitedTabs((current) =>
        current.includes(from) ? current : [...current, from],
      );
      setShownTab(next);
    },
    [tabsY, headerHeight, scrollY],
  );

  const selectTab = useCallback(
    (next: EventTabKey) => {
      const from = activeTabRef.current;

      if (next === from || !from) {
        return;
      }

      // Eerst het segment laten doorschuiven, dan de inhoud wisselen.
      setPickedTab(next);

      if (switchTimer.current) {
        clearTimeout(switchTimer.current);
      }

      switchTimer.current = setTimeout(
        () => showTab(next, from),
        SEGMENT_SLIDE_MS,
      );
    },
    [showTab],
  );

  // De kop staat één keer boven de tabs en schuift mee met de actieve lijst,
  // zodat een tabwissel hem niet opnieuw opbouwt. Tijdens het laden toont hij
  // de gegevens uit de link; daarna komen de tabs erbij, zonder hem te
  // vervangen.
  const heroEvent = event ?? preview;
  const [heroLayout, setHeroLayout] = useState({
    height: 0,
    /** Gemeten met de tabs erin, dus de definitieve hoogte. */
    hasTabs: false,
  });
  const heroHeight = heroLayout.height;
  const hasPicker = tabs.length > 1;
  const [heroShift] = useState(() => Animated.multiply(scrollY, -1));

  const spacer = useMemo(
    () => <View style={{ height: heroHeight }} />,
    [heroHeight],
  );

  // Alle bezochte tabs, en altijd de tab die nu in beeld is.
  const mountedTabs = activeTab
    ? [...new Set([...visitedTabs, activeTab])]
    : [];
  // Pas als de kop zijn definitieve hoogte heeft, anders schuift de inhoud.
  const isReady =
    !isLoading &&
    event !== undefined &&
    heroHeight > 0 &&
    (!hasPicker || heroLayout.hasTabs);

  return (
    <>
      <Stack.Screen
        options={{
          title: isTitleShown && event ? event.name : "",
          // Doorzichtig boven de kop, het standaard materiaal zodra de titel er staat.
          headerBlurEffect: isTitleShown ? "systemChromeMaterial" : "none",
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.OS === "ios" ? "checklist" : undefined}
          accessibilityLabel="Uitslagen invoeren"
          hidden={!event?.canManage}
          onPress={() => router.push(`/manage/${eventId}`)}
        >
          Uitslagen
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      {!heroEvent ? (
        // Zonder gegevens uit de link (bijv. een deeplink): alleen een skeleton.
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background, paddingTop: headerHeight },
          ]}
        >
          <EventBodySkeleton />
        </View>
      ) : (
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {isReady ? (
            mountedTabs.map((key) => {
              const handlers = tabHandlers.get(key);
              const isActive = key === activeTab;

              if (!handlers) {
                return null;
              }

              const value: EventScrollValue = {
                header: spacer,
                headerHeight: heroHeight,
                scrollY,
                onOffset: handlers.onOffset,
                registerScroll: handlers.registerScroll,
                initialOffset: initialOffsets[key] ?? 0,
              };

              return (
                <View
                  key={key}
                  style={[
                    styles.page,
                    isActive ? styles.active : styles.hidden,
                  ]}
                  pointerEvents={isActive ? "auto" : "none"}
                  accessibilityElementsHidden={!isActive}
                  importantForAccessibility={
                    isActive ? "auto" : "no-hide-descendants"
                  }
                >
                  <EventScrollContext.Provider value={value}>
                    <EventTabContent eventId={eventId} tab={key} />
                  </EventScrollContext.Provider>
                </View>
              );
            })
          ) : (
            // Onder de kop, zolang de tabs nog laden.
            <View style={{ paddingTop: heroHeight }}>
              <EventBodySkeleton showTabs={hasPicker === false && !event} />
            </View>
          )}

          <Animated.View
            pointerEvents="box-none"
            style={[styles.hero, { transform: [{ translateY: heroShift }] }]}
            onLayout={(layoutEvent) =>
              setHeroLayout({
                height: Math.round(layoutEvent.nativeEvent.layout.height),
                hasTabs: hasPicker && segmentTab !== null,
              })
            }
          >
            <EventHero
              event={heroEvent}
              scrollY={scrollY}
              onChildrenLayout={setTabsY}
            >
              {hasPicker && segmentTab ? (
                <EventTabPicker
                  tabs={tabs}
                  selected={segmentTab}
                  onSelect={selectTab}
                />
              ) : null}
            </EventHero>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { ...StyleSheet.absoluteFill },
  hero: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  active: { opacity: 1, zIndex: 1 },
  // Onzichtbaar maar bewaard: de lijst houdt zo zijn plek.
  hidden: { opacity: 0, zIndex: 0 },
});
