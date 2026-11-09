import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** Zoekveld bovenaan de lijst, zoals de iOS-zoekbalk. */
export function AthleteSearchField({ value, onChange, placeholder }: Props) {
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
        returnKeyType="search"
        style={[styles.input, { color: colors.label }]}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Wis zoekterm"
        >
          <SymbolView
            name="xmark.circle.fill"
            size={17}
            tintColor={colors.tertiaryLabel as string}
          />
        </Pressable>
      ) : null}
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
