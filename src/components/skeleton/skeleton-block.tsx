import { View, type DimensionValue, type ViewStyle } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  width?: DimensionValue;
  height: number;
  /** Afronding; `"round"` maakt er een cirkel of capsule van. */
  radius?: number | "round";
  style?: ViewStyle;
}

/** Eén grijs vlak in een skeleton: een regel tekst, een foto of een knop. */
export function SkeletonBlock({
  width = "100%",
  height,
  radius = 6,
  style,
}: Props) {
  const colors = useAppColors();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius === "round" ? height / 2 : radius,
          backgroundColor: colors.fill,
        },
        style,
      ]}
    />
  );
}
