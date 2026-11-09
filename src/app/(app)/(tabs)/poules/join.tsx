import { TextInput } from "@expo/ui";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { api } from "@convex/_generated/api";
import { AppText } from "@/components/ui/app-text";
import { NavRow } from "@/components/ui/nav-row";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { Screen, Section } from "@/components/ui/screen";
import { showError } from "@/utils/error-message";
import { moduleIcon } from "@/utils/sport-icon";

export default function JoinScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? "");
  const [busy, setBusy] = useState(false);
  const join = useMutation(api.poules.join);

  const cleaned = code.trim();
  const preview = useQuery(
    api.poules.previewByCode,
    cleaned.length >= 6 ? { inviteCode: cleaned } : "skip",
  );

  const submit = async () => {
    setBusy(true);

    try {
      const pouleId = await join({ inviteCode: cleaned });
      router.dismiss();
      router.push(`/poules/${pouleId}`);
    } catch (error) {
      showError("Meedoen mislukt", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ModalToolbar
        onConfirm={submit}
        isConfirmDisabled={busy || !preview}
        confirmLabel={preview?.alreadyMember ? "Naar de poule" : "Meedoen"}
      />

      <Section title="Uitnodigingscode">
        <TextInput
          placeholder="RIV-XXXXXX"
          defaultValue={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
        />
      </Section>

      {preview ? (
        <Section title="Je doet mee met">
          <NavRow
            leadingText={preview.emoji ?? undefined}
            icon={preview.emoji ? undefined : "trophy.fill"}
            title={preview.name}
            subtitle={`Van ${preview.ownerName}`}
          />
          {preview.events.map((event) => (
            <NavRow
              key={event.name}
              icon={moduleIcon(event.moduleKey)}
              title={event.name}
              subtitle={event.moduleName}
            />
          ))}
        </Section>
      ) : null}

      {cleaned.length >= 6 && preview === null ? (
        <Section>
          <AppText variant="secondary">
            Geen open poule gevonden met deze code.
          </AppText>
        </Section>
      ) : null}
    </Screen>
  );
}
