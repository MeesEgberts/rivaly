import { StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { HIT_COLORS, PODIUM_COLORS } from "@/constants/cycling-colors";
import { useAppColors } from "@/hooks/use-app-colors";
import type { PodiumSlot } from "@/utils/cycling";

interface Props {
  slot: PodiumSlot;
}

const BLOCK_HEIGHT: Record<number, number> = { 1: 60, 2: 46, 3: 36 };

const HIT_LABEL = { exact: "Juiste plek", inTop: "Wel op podium" } as const;

/** Eén trede: renner (of een lege plek) met daaronder het blok in goud/zilver/brons. */
export function PodiumStep({ slot }: Props) {
  const colors = useAppColors();
  const isMiss = slot.hit === "miss";

  return (
    <View style={styles.column}>
      <View style={styles.rider}>
        {slot.rider ? (
          <>
            {slot.rider.code ? <TeamBadge code={slot.rider.code} /> : null}
            <Text
              numberOfLines={1}
              style={[
                styles.name,
                { color: isMiss ? colors.tertiaryLabel : colors.label },
                isMiss && styles.strike,
              ]}
            >
              {slot.rider.name}
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.empty, { borderColor: colors.separator }]}>
              <Text style={[styles.emptyMark, { color: colors.tertiaryLabel }]}>
                ?
              </Text>
            </View>
            <Text style={[styles.name, { color: colors.tertiaryLabel }]}>
              Kies
            </Text>
          </>
        )}
        {slot.hit === "exact" || slot.hit === "inTop" ? (
          <Text style={[styles.hit, { color: HIT_COLORS[slot.hit] }]}>
            {HIT_LABEL[slot.hit]}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.block,
          {
            height: BLOCK_HEIGHT[slot.position] ?? 40,
            backgroundColor: PODIUM_COLORS[slot.position] ?? colors.fill,
          },
        ]}
      >
        <Text style={styles.position}>{slot.position}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, justifyContent: "flex-end", gap: 8 },
  rider: { alignItems: "center", gap: 4, paddingHorizontal: 2 },
  name: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  strike: { textDecorationLine: "line-through" },
  empty: {
    width: 34,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMark: { fontSize: 12, fontWeight: "700" },
  hit: { fontSize: 11, fontWeight: "700" },
  block: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  position: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
});
