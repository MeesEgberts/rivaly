import type { ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  title?: string;
  /** Kop binnen de kaart, bijv. een `CardHeader`. */
  header?: ReactNode;
  /** Korte toelichting onder de kaart. */
  footer?: string;
  children: ReactNode;
}

/**
 * Afgeronde kaart met kop, zoals een inset-grouped sectie op iOS en een
 * kaart in een Material-lijst. Voor eigen views die niet in een `Form` passen.
 */
export function InsetCard({ title, header, footer, children }: Props) {
  const colors = useAppColors();

  return (
    <View style={styles.section}>
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color:
                Platform.OS === "android"
                  ? colors.accent
                  : colors.secondaryLabel,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {header}
        {children}
      </View>
      {footer ? (
        <Text style={[styles.footer, { color: colors.secondaryLabel }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 16, marginTop: 20 },
  title: {
    fontSize: 13,
    fontWeight: Platform.OS === "android" ? "600" : "400",
    marginHorizontal: 16,
    marginBottom: 6,
  },
  card: {
    borderRadius: Platform.OS === "android" ? 16 : 12,
    overflow: "hidden",
  },
  footer: { fontSize: 13, marginHorizontal: 16, marginTop: 6, lineHeight: 18 },
});
