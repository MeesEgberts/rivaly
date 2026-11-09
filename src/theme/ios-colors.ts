import { PlatformColor } from "react-native";

/** Semantische UIKit-kleuren, zodat tekst en iconen meebewegen met dark mode. */
export const iosColors = {
  label: PlatformColor("label"),
  secondaryLabel: PlatformColor("secondaryLabel"),
  tertiaryLabel: PlatformColor("tertiaryLabel"),
  accent: PlatformColor("systemBlue"),
};

/** Extra systeemkleuren voor badges en status in SwiftUI-rijen. */
export const iosStatusColors = {
  success: PlatformColor("systemGreen"),
  fill: PlatformColor("tertiarySystemFill"),
};
