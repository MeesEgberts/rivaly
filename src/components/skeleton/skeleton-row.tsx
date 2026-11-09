import { StyleSheet, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import { SkeletonBlock } from "./skeleton-block";

interface Props {
  /** Rond beeld links (avatar, logo) of niets. */
  leading?: "circle" | "square" | "none";
  /** Breedte van de titel, zodat rijen niet allemaal even lang zijn. */
  titleWidth?: `${number}%`;
  hasSubtitle?: boolean;
  /** Iets rechts, zoals punten of een chip. */
  hasTrailing?: boolean;
  isLast?: boolean;
}

/** Skeleton van een `CardRow`: beeld, titel, ondertitel en iets rechts. */
export function SkeletonRow({
  leading = "circle",
  titleWidth = "55%",
  hasSubtitle = true,
  hasTrailing = false,
  isLast = false,
}: Props) {
  const colors = useAppColors();

  return (
    <View style={styles.row}>
      {leading !== "none" ? (
        <SkeletonBlock
          width={34}
          height={34}
          radius={leading === "circle" ? "round" : 9}
        />
      ) : null}
      <View
        style={[
          styles.body,
          !isLast && {
            borderBottomColor: colors.separator,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={styles.text}>
          <SkeletonBlock width={titleWidth} height={14} />
          {hasSubtitle ? <SkeletonBlock width="35%" height={11} /> : null}
        </View>
        {hasTrailing ? (
          <SkeletonBlock width={40} height={18} radius="round" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 14 },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingRight: 14,
  },
  text: { flex: 1, gap: 7 },
});
