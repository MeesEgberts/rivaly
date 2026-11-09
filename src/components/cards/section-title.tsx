import { StyleSheet, Text } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  children: string;
}

/** Kop boven een groep kaarten, zoals een iOS-sectiekop. */
export function SectionTitle({ children }: Props) {
  const colors = useAppColors();

  return (
    <Text style={[styles.title, { color: colors.label }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", marginTop: 8, marginHorizontal: 4 },
});
