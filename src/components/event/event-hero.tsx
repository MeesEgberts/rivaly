import { Image } from "expo-image";
import { useHeaderHeight } from "expo-router/react-navigation";
import type { ReactNode } from "react";
import { Animated, StyleSheet, Text, View, useColorScheme } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { eventSubtitle, PHOTO_TOP_SHADE, photoFade } from "@/utils/event-text";
import { fadeInOnce } from "@/utils/image-fade";

import { EventBadge } from "./event-badge";

interface Props {
  event: {
    name: string;
    moduleKey: string;
    moduleName: string;
    seriesNames: string[];
    startsAt: number;
    endsAt: number;
    imageUrl: string | null;
    logoUrl: string | null;
    color: string | null;
  };
  scrollY: Animated.Value;
  /** Onder de naam, bijv. de tabs van het evenement. */
  children?: ReactNode;
  /** Waar de tabs in de kop beginnen (vanaf de bovenkant van de lijst). */
  onChildrenLayout?: (y: number) => void;
}

/** Hoogte van de foto onder de navigatiebalk. */
export const PHOTO_HEIGHT = 190;
const BADGE_SIZE = 84;

/**
 * Kop van een evenement zoals Apple Kaarten een plek toont: een foto die
 * onder de navigatiebalk doorloopt en meerekt als je omlaag trekt, met het
 * logo gecentreerd op de rand en daaronder naam en datum. Zonder foto blijft
 * alleen het beeldmerk met naam over, net als bij een plek zonder foto's.
 */
export function EventHero({
  event,
  scrollY,
  children,
  onChildrenLayout,
}: Props) {
  const colors = useAppColors();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const headerHeight = useHeaderHeight();
  const photoHeight = headerHeight + PHOTO_HEIGHT;

  // Omlaag trekken: de foto groeit mee en blijft tegen de bovenrand.
  // Omhoog scrollen: de foto schuift iets langzamer weg dan de inhoud.
  const photoTransform = [
    {
      translateY: scrollY.interpolate({
        inputRange: [-photoHeight, 0, photoHeight],
        outputRange: [-photoHeight / 2, 0, photoHeight * 0.35],
        extrapolateRight: "clamp",
      }),
    },
    {
      scale: scrollY.interpolate({
        inputRange: [-photoHeight, 0],
        outputRange: [2, 1],
        extrapolateRight: "clamp",
      }),
    },
  ];

  // De kop ligt boven de lijst: alleen de tabs vangen tikken op, de rest laat
  // vegen door naar de lijst eronder.
  return (
    <View pointerEvents="box-none">
      {event.imageUrl ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.photo,
            { height: photoHeight, transform: photoTransform },
          ]}
        >
          <Image
            source={{ uri: event.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={fadeInOnce(event.imageUrl)}
          />
          <View
            style={[
              styles.topShade,
              {
                height: headerHeight,
                experimental_backgroundImage: PHOTO_TOP_SHADE,
              },
            ]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { experimental_backgroundImage: photoFade(scheme) },
            ]}
          />
        </Animated.View>
      ) : (
        <View pointerEvents="none" style={{ height: headerHeight + 8 }} />
      )}

      <View
        pointerEvents="none"
        style={[
          styles.identity,
          event.imageUrl ? { marginTop: -BADGE_SIZE / 2 } : null,
        ]}
      >
        <EventBadge
          logoUrl={event.logoUrl}
          moduleKey={event.moduleKey}
          color={event.color}
          size={BADGE_SIZE}
        />
        <Text
          style={[styles.name, { color: colors.label }]}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {event.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryLabel }]}>
          {eventSubtitle(event)}
        </Text>
      </View>

      {children ? (
        <View
          style={styles.extra}
          onLayout={(layoutEvent) =>
            onChildrenLayout?.(layoutEvent.nativeEvent.layout.y)
          }
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { overflow: "hidden" },
  topShade: { position: "absolute", top: 0, left: 0, right: 0 },
  identity: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: { fontSize: 15, textAlign: "center" },
  extra: { marginTop: 12 },
});
