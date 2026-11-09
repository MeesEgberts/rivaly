import { StyleSheet, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  /** Tussen 0 en 1. */
  value: number;
}

export function ProgressBar({ value }: Props) {
  const colors = useAppColors();
  const percentage =
    `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%` as const;

  return (
    <View style={[styles.track, { backgroundColor: colors.fill }]}>
      <View
        style={[
          styles.fill,
          { width: percentage, backgroundColor: colors.accent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});
