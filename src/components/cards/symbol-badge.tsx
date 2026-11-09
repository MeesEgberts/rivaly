import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  name: SFSymbol;
  /** Kleur van het symbool; standaard de accentkleur. */
  tint?: string;
  size?: number;
}

/** SF Symbol in een rond vlak, als beeldmerk bovenaan een kaart. */
export function SymbolBadge({ name, tint, size = 52 }: Props) {
  const colors = useAppColors();

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
        name={name}
        size={size * 0.5}
        tintColor={tint ?? (colors.accent as string)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
});
