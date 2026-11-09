import { SymbolView } from "expo-symbols";
import { StyleSheet, TextInput, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Zoekveld boven een lange keuzelijst, in de stijl van een iOS-zoekbalk. */
export function OptionSearchField({
  value,
  onChange,
  placeholder = "Zoek",
}: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.field, { backgroundColor: colors.fill }]}>
      <SymbolView
        name="magnifyingglass"
        size={16}
        tintColor={colors.secondaryLabel as string}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryLabel}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={[styles.input, { color: colors.label }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  input: { flex: 1, fontSize: 17 },
});
