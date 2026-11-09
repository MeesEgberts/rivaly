import { useHostedAuth } from "@clerk/expo/hosted-auth";
import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingScreen } from "@/components/loading-screen";
import { ActionBar } from "@/components/ui/action-bar";
import { ActionButton } from "@/components/ui/action-button";
import { BrandHero } from "@/components/ui/brand-hero";
import { showError } from "@/utils/error-message";

export default function SignInScreen() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { startHostedAuth } = useHostedAuth();
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  const start = async (mode: "sign-in" | "sign-up") => {
    setBusy(true);

    try {
      await startHostedAuth({ mode });
    } catch (error) {
      showError("Inloggen mislukt", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <BrandHero
        title="Rivaly"
        subtitle="Maak poules met vrienden op voetbal, schaatsen en meer."
      />
      <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <ActionBar>
          <ActionButton
            label="Inloggen"
            onPress={() => start("sign-in")}
            disabled={busy}
          />
          <ActionButton
            label="Account maken"
            variant="secondary"
            onPress={() => start("sign-up")}
            disabled={busy}
          />
        </ActionBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
