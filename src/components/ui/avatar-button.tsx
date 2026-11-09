import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";

const SIZE = 32;

/**
 * Profielfoto van de ingelogde gebruiker voor in de navigatiebalk; opent
 * het Clerk-accountscherm. Vervangt Clerk's UserButton, die in een native
 * header het hele scherm overneemt.
 */
export function AvatarButton() {
  const { user } = useUser();
  const imageUrl = user?.imageUrl;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Account"
      hitSlop={8}
      onPress={() => router.push("/account")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          transition={150}
        />
      ) : (
        <SymbolView name="person.crop.circle.fill" size={SIZE} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
  },
  pressed: {
    opacity: 0.6,
  },
  image: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
});
