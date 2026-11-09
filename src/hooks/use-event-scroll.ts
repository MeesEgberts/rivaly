import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

export interface EventScrollValue {
  /**
   * Ruimte voor de kop bovenaan elke tab. De kop zelf wordt één keer
   * getekend, boven de tabs, en schuift mee met de lijst die in beeld is.
   */
  header: ReactNode;
  /** Hoogte van de kop, voor de scrollbalk. */
  headerHeight: number;
  /** Verticale scrollpositie, voor het meerekkende beeld. */
  scrollY: Animated.Value;
  /** Laat het scherm weten waar deze tab is, voor titel en tabwissel. */
  onOffset: (y: number) => void;
  /** Waar deze tab begint, zodat de tabs bij een wissel op hun plek blijven. */
  initialOffset: number;
  /** De lijst van deze tab, zodat het scherm hem kan verschuiven. */
  registerScroll: (node: ScrollViewInstance | null) => void;
}

export const EventScrollContext = createContext<EventScrollValue | null>(null);

/**
 * Koppelt de verticale lijst van een evenement-tab aan de kop: geeft de kop
 * om bovenaan te tonen, de props voor een `Animated.ScrollView` en een ref.
 * Een tab die zelf ook scrollposities nodig heeft, geeft een `listener` mee.
 */
export function useEventScroll(listener?: (event: ScrollEvent) => void) {
  const value = useContext(EventScrollContext);

  if (!value) {
    throw new Error("useEventScroll werkt alleen binnen het evenementscherm.");
  }

  const {
    header,
    headerHeight,
    scrollY,
    onOffset,
    initialOffset,
    registerScroll,
  } = value;

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (event: ScrollEvent) => {
          onOffset(event.nativeEvent.contentOffset.y);
          listener?.(event);
        },
      }),
    [scrollY, onOffset, listener],
  );

  return {
    header,
    scrollRef: registerScroll,
    scrollProps: {
      onScroll,
      scrollEventThrottle: 16,
      contentOffset: { x: 0, y: initialOffset },
      scrollIndicatorInsets: { top: headerHeight },
      // De kop loopt zelf onder de doorzichtige navigatiebalk door.
      contentInsetAdjustmentBehavior: "never" as const,
    },
  };
}
