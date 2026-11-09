import { StyleSheet, View } from "react-native";

import { Card } from "@/components/cards/card";

import { Skeleton } from "./skeleton";
import { SkeletonBlock } from "./skeleton-block";

/** Pouleoverzicht tijdens het laden: twee poulekaarten. */
export function PoulesSkeleton() {
  return (
    <Skeleton>
      {[0, 1].map((index) => (
        <Card key={index}>
          <View style={styles.row}>
            <SkeletonBlock width={56} height={56} radius="round" />
            <View style={styles.text}>
              <SkeletonBlock width={index === 0 ? "55%" : "40%"} height={18} />
              <SkeletonBlock width="45%" height={12} />
              <SkeletonBlock width={16} height={14} radius={4} />
            </View>
            <SkeletonBlock width={34} height={34} radius="round" />
          </View>
        </Card>
      ))}
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  text: { flex: 1, gap: 7 },
});
