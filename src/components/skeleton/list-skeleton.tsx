import { StyleSheet, View } from "react-native";

import { Skeleton } from "./skeleton";
import { SkeletonBlock } from "./skeleton-block";
import { SkeletonCardList } from "./skeleton-card-list";

interface Props {
  /** Aantal rijen per sectie. */
  sections?: number[];
  leading?: "circle" | "square" | "none";
}

/**
 * Gegroepeerde lijst tijdens het laden, zoals Instellingen en de catalogus:
 * per sectie een kopje en een kaart met rijen.
 */
export function ListSkeleton({ sections = [4], leading = "square" }: Props) {
  return (
    <Skeleton style={styles.container}>
      {sections.map((rows, index) => (
        <View key={index} style={styles.section}>
          <SkeletonBlock width={90} height={12} style={styles.title} />
          <SkeletonCardList rows={rows} leading={leading} />
        </View>
      ))}
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 24 },
  section: { gap: 8 },
  title: { marginLeft: 16 },
});
