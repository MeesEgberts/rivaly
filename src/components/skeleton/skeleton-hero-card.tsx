import { StyleSheet, View } from "react-native";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";

import { SkeletonBlock } from "./skeleton-block";

/** Kopkaart van een poule of lid: groot rond beeld, naam en drie cijfers. */
export function SkeletonHeroCard() {
  const colors = useAppColors();

  return (
    <Card>
      <View style={styles.content}>
        <SkeletonBlock width={72} height={72} radius="round" />
        <SkeletonBlock width="45%" height={24} style={styles.name} />
        <SkeletonBlock width="30%" height={13} />
        <View style={[styles.stats, { borderTopColor: colors.separator }]}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.stat}>
              <SkeletonBlock width={34} height={26} />
              <SkeletonBlock width={56} height={11} />
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", gap: 8 },
  name: { marginTop: 8 },
  stats: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stat: { flex: 1, alignItems: "center", gap: 6 },
});
