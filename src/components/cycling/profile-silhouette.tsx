import { StyleSheet, View } from "react-native";

import {
  STAGE_PROFILES,
  type StageProfile,
} from "@modules/cycling/stage-profile";
import { useAppColors } from "@/hooks/use-app-colors";
import { resampleElevation } from "@/utils/cycling";

const POINTS = 64;

interface Props {
  profile: StageProfile;
  height?: number;
}

/** Gestileerd hoogteprofiel als vlak, van start (links) tot finish (rechts). */
export function ProfileSilhouette({ profile, height = 64 }: Props) {
  const colors = useAppColors();
  const elevation = resampleElevation(
    STAGE_PROFILES[profile].elevation,
    POINTS,
  );

  return (
    <View style={[styles.row, { height }]} accessible={false}>
      {elevation.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              // Een vaste basis, zodat ook een vlakke rit zichtbaar is.
              height: height * (0.18 + 0.82 * value),
              backgroundColor: colors.accent,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 6,
    overflow: "hidden",
  },
  bar: { flex: 1 },
});
