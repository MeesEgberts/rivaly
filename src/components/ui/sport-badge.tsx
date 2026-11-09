import { StyleSheet, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import { SportIcon } from "./sport-icon";

interface Props {
  moduleKey: string;
  size?: number;
}

/** Sporticoon in een rond vlak, zoals `SymbolBadge`. */
export function SportBadge({ moduleKey, size = 52 }: Props) {
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
      <SportIcon
        moduleKey={moduleKey}
        size={size * 0.5}
        color={colors.accent as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
});
