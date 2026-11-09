import { Host, Text, useMaterialColors } from "@expo/ui/jetpack-compose";
import { padding } from "@expo/ui/jetpack-compose/modifiers";

export function AuthLogo() {
  const colors = useMaterialColors();

  return (
    <Host matchContents style={{ alignSelf: "center" }}>
      <Text
        color={colors.primary}
        style={{ typography: "displaySmall", textAlign: "center" }}
        modifiers={[padding(0, 24, 0, 8)]}
      >
        Rivaly
      </Text>
    </Host>
  );
}
