import { StyleSheet, View } from "react-native";

import { Card } from "@/components/cards/card";

import { Skeleton } from "./skeleton";
import { SkeletonBlock } from "./skeleton-block";

/** Voorspelscherm tijdens het laden: vraagkaart en het invulvlak. */
export function PredictSkeleton() {
  return (
    <Skeleton style={styles.container}>
      <Card>
        <View style={styles.header}>
          <SkeletonBlock width={48} height={48} radius="round" />
          <View style={styles.headerText}>
            <SkeletonBlock width="60%" height={11} />
            <SkeletonBlock width="45%" height={22} />
          </View>
        </View>
        <SkeletonBlock
          width={140}
          height={26}
          radius="round"
          style={styles.pill}
        />
      </Card>
      <Card>
        <View style={styles.body}>
          <SkeletonBlock width="30%" height={11} />
          <View style={styles.podium}>
            <SkeletonBlock width="30%" height={70} radius={10} />
            <SkeletonBlock width="30%" height={100} radius={10} />
            <SkeletonBlock width="30%" height={55} radius={10} />
          </View>
        </View>
      </Card>
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerText: { flex: 1, gap: 8 },
  pill: { marginTop: 16 },
  body: { gap: 16 },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
});
