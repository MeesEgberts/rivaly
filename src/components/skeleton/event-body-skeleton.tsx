import { StyleSheet, View } from "react-native";

import { Card } from "@/components/cards/card";

import { Skeleton } from "./skeleton";
import { SkeletonBlock } from "./skeleton-block";

interface Props {
  /** Ook de tabs, als de kop ze nog niet toont. */
  showTabs?: boolean;
}

/**
 * Inhoud van een evenement tijdens het laden, onder de kop: (de tabs,) een
 * voortgangskaart en een raster van vraagkaarten.
 */
export function EventBodySkeleton({ showTabs = true }: Props) {
  return (
    <Skeleton style={styles.container}>
      {showTabs ? <SkeletonBlock height={32} radius="round" /> : null}
      <Card>
        <View style={styles.progress}>
          <SkeletonBlock width="55%" height={15} />
          <SkeletonBlock width="40%" height={11} />
          <SkeletonBlock height={6} radius="round" />
        </View>
      </Card>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((index) => (
          <Card key={index} style={styles.tile}>
            <View style={styles.tileContent}>
              <SkeletonBlock width={44} height={44} radius="round" />
              <SkeletonBlock width="70%" height={15} />
              <SkeletonBlock width="50%" height={11} />
            </View>
          </Card>
        ))}
      </View>
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
  progress: { gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%", flexGrow: 1 },
  tileContent: { gap: 8 },
});
