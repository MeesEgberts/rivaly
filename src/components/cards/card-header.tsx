import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  title: string;
  /** Korte tekst in het rondje links, bijv. "A" voor groep A. */
  letter?: string;
  /** Of een symbool in het rondje, bijv. een trofee bij de finale. */
  icon?: SFSymbol;
  /** Rechts: voortgang zoals "4/6", of `null` voor niets. */
  trailing?: string | null;
  /** Alles ingevuld: groen vinkje in plaats van de voortgang. */
  isComplete?: boolean;
}

/** Kop boven in een kaart: rondje met letter of symbool, titel en voortgang. */
export function CardHeader({
  title,
  letter,
  icon,
  trailing,
  isComplete = false,
}: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.header, { borderBottomColor: colors.separator }]}>
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        {icon ? (
          <SymbolView
            name={icon}
            size={14}
            tintColor={colors.onAccent as string}
          />
        ) : (
          <Text style={[styles.letter, { color: colors.onAccent }]}>
            {letter}
          </Text>
        )}
      </View>
      <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
      {isComplete ? (
        <SymbolView
          name="checkmark.circle.fill"
          size={18}
          tintColor={colors.success as string}
        />
      ) : trailing ? (
        <Text style={[styles.trailing, { color: colors.secondaryLabel }]}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: { fontSize: 14, fontWeight: "800" },
  title: { flex: 1, fontSize: 17, fontWeight: "700" },
  trailing: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
});
