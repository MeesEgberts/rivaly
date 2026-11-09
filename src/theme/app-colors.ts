import type { ColorValue } from "react-native";

/**
 * Kleuren voor eigen React Native-views (bracket, cijferblok, wedstrijdkaart)
 * die niet uit `@expo/ui` komen. iOS gebruikt de semantische UIKit-kleuren,
 * Android het Material 3-palet van het toestel, zodat beide meebewegen met
 * dark mode en het systeemthema.
 */
export interface AppColors {
  /** Achtergrond achter gegroepeerde inhoud. */
  background: ColorValue;
  /** Kaarten en rijen op de achtergrond. */
  card: ColorValue;
  label: ColorValue;
  secondaryLabel: ColorValue;
  tertiaryLabel: ColorValue;
  separator: ColorValue;
  /** Neutrale vulling voor invoervakken en toetsen. */
  fill: ColorValue;
  accent: ColorValue;
  onAccent: ColorValue;
  /** Zachte accentvulling, bijv. het actieve invoervak. */
  accentSoft: ColorValue;
  success: ColorValue;
  danger: ColorValue;
  /** Achtergrond van het cijferblok. */
  keypad: ColorValue;
  /** Toetsen op het cijferblok. */
  key: ColorValue;
}
