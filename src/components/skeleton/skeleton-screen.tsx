import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  children: ReactNode;
}

/**
 * Scrollscherm voor een skeleton, met dezelfde marges als de kaartschermen
 * (poule, lid, home), zodat de echte inhoud er precies overheen valt.
 */
export function SkeletonScreen({ children }: Props) {
  const colors = useAppColors();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      scrollEnabled={false}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
});
