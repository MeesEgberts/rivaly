import type { FixturePayload } from "@modules/validators";
import { NavRow } from "@/components/ui/nav-row";
import { Section } from "@/components/ui/screen";
import type { FixtureDraft, FixtureFormMode } from "@/utils/fixture-draft";

interface Props {
  payload: Extract<FixturePayload, { type: "pick" }>;
  draft: FixtureDraft;
  onChange: (draft: FixtureDraft) => void;
  mode: FixtureFormMode;
}

/** Eén keuze: een lijst met een vinkje, zoals de instellingen van iOS. */
export function PickFields({ payload, draft, onChange, mode }: Props) {
  const title = mode === "result" ? "Uitslag" : "Tik je keuze";

  return (
    <Section title={title}>
      {payload.options.map((option) => (
        <NavRow
          key={option.id}
          title={option.label}
          selected={draft.optionId === option.id}
          onPress={() => onChange({ ...draft, optionId: option.id })}
        />
      ))}
    </Section>
  );
}
