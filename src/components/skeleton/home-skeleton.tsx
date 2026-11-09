import { StyleSheet, View } from "react-native";

import { Card } from "@/components/cards/card";
import { SectionTitle } from "@/components/cards/section-title";

import { Skeleton } from "./skeleton";
import { SkeletonBlock } from "./skeleton-block";
import { SkeletonCardList } from "./skeleton-card-list";

/** Startscherm tijdens het laden: deadlinekaart, wat daarna komt en evenementen. */
export function HomeSkeleton() {
  return (
    <Skeleton>
      <Card>
        <View style={styles.deadline}>
          <View style={styles.header}>
            <SkeletonBlock width={44} height={44} radius="round" />
            <View style={styles.headerText}>
              <SkeletonBlock width="50%" height={12} />
              <SkeletonBlock width="35%" height={12} />
            </View>
          </View>
          <SkeletonBlock width="60%" height={28} />
          <SkeletonBlock width={150} height={26} radius="round" />
          <SkeletonBlock height={48} radius={14} />
        </View>
      </Card>
      <SectionTitle>Daarna</SectionTitle>
      <SkeletonCardList rows={3} hasTrailing />
      <SectionTitle>Jouw evenementen</SectionTitle>
      <SkeletonCardList rows={2} leading="square" />
    </Skeleton>
  );
}

const styles = StyleSheet.create({
  deadline: { gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1, gap: 7 },
});
