import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import type { Jersey } from "@modules/cycling/stage-profile";
import { JERSEY_COLORS, POLKA_DOT_COLORS } from "@/constants/cycling-colors";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  jersey: Jersey;
  size?: number;
}

/** Een trui in de kleur van het klassement, met bollen voor de bergtrui. */
export function JerseyIcon({ jersey, size = 52 }: Props) {
  const colors = useAppColors();
  const shirt = size * 0.62;
  const dot = size * 0.06;
  const dotColor = POLKA_DOT_COLORS[jersey];

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.fill,
        },
      ]}
    >
      <SymbolView
        name="tshirt.fill"
        size={shirt}
        tintColor={JERSEY_COLORS[jersey]}
      />
      {jersey === "white" || dotColor ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.center}>
            <SymbolView
              name="tshirt"
              size={shirt}
              tintColor="rgba(0,0,0,0.18)"
            />
          </View>
        </View>
      ) : null}
      {dotColor
        ? POLKA_DOTS.map(([x, y], index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  left: size * x - dot / 2,
                  top: size * y - dot / 2,
                  backgroundColor: dotColor,
                },
              ]}
            />
          ))
        : null}
    </View>
  );
}

/** Plekken van de bollen, als fractie van het vak. */
const POLKA_DOTS: [number, number][] = [
  [0.4, 0.44],
  [0.6, 0.44],
  [0.5, 0.53],
  [0.4, 0.62],
  [0.6, 0.62],
  [0.5, 0.71],
];

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute" },
});
