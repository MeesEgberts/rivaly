import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { iosColors } from "@/theme/ios-colors";

export function AuthLogo() {
  return (
    <View style={styles.container} accessibilityRole="header">
      <SymbolView
        name="trophy.fill"
        size={56}
        tintColor={iosColors.accent}
        accessibilityLabel="Rivaly"
      />
      <Text style={styles.title}>Rivaly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: iosColors.label,
  },
});
