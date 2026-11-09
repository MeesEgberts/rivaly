import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import {
  STAGE_PROFILES,
  type StageProfile,
} from "@modules/cycling/stage-profile";
import { STAGE_PROFILE_ICON } from "@/constants/stage-profile-icon";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  profile: StageProfile;
}

/** Soort rit met uitleg: icoon, "Aankomst bergop" en voor wie dat gunstig is. */
export function ProfileBadge({ profile }: Props) {
  const colors = useAppColors();
  const info = STAGE_PROFILES[profile];

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
        <SymbolView
          name={STAGE_PROFILE_ICON[profile]}
          size={18}
          tintColor={colors.accent as string}
        />
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.label }]}>
          {info.label}
        </Text>
        <Text style={[styles.favours, { color: colors.secondaryLabel }]}>
          {info.favours}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 1 },
  label: { fontSize: 15, fontWeight: "600" },
  favours: { fontSize: 13 },
});
