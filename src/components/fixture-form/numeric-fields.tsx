import type { FixturePayload } from "@modules/validators";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Section } from "@/components/ui/screen";
import type { FixtureDraft } from "@/utils/fixture-draft";

interface Props {
  payload: Extract<FixturePayload, { type: "numeric" }>;
  draft: FixtureDraft;
  onChange: (draft: FixtureDraft) => void;
}

export function NumericFields({ payload, draft, onChange }: Props) {
  const title = payload.unit ? `Aantal ${payload.unit}` : "Getal";

  return (
    <Section title={title}>
      <NumberStepper
        label={payload.unit ?? "Waarde"}
        value={draft.value}
        min={payload.min ?? 0}
        max={payload.max ?? 999}
        step={payload.step ?? 1}
        onChange={(value) => onChange({ ...draft, value })}
      />
    </Section>
  );
}
