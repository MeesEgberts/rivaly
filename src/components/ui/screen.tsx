import { FieldGroup, Host } from "@expo/ui";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionBar } from "./action-bar";

interface Props {
  children: ReactNode;
  /** Knoppen die onderaan vast blijven staan, los van de scrollende inhoud. */
  footer?: ReactNode;
}

/**
 * Standaardscherm: gegroepeerde, scrollende secties (iOS: Form, Android:
 * Material-lijst) met optioneel een vaste actiebalk onderaan.
 */
export function Screen({ children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Host style={styles.host}>
        <FieldGroup>{children}</FieldGroup>
      </Host>
      {footer ? (
        <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <ActionBar>{footer}</ActionBar>
        </View>
      ) : null}
    </View>
  );
}

export const Section = FieldGroup.Section;
export const SectionFooter = FieldGroup.SectionFooter;

const styles = StyleSheet.create({
  container: { flex: 1 },
  host: { flex: 1 },
});
