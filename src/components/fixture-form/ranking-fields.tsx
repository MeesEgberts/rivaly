import type { FixturePayload } from "@modules/validators";
import { NavRow } from "@/components/ui/nav-row";
import { Section } from "@/components/ui/screen";
import { NO_CHOICE, type FixtureDraft } from "@/utils/fixture-draft";
import { ordinal } from "@/utils/format";

interface Props {
  payload: Extract<FixturePayload, { type: "ranking" }>;
  draft: FixtureDraft;
  onChange: (draft: FixtureDraft) => void;
}

/**
 * Volgorde: tik de teams in de volgorde van eindigen. Nog eens tikken haalt
 * een team eruit; de rest schuift op.
 */
export function RankingFields({ payload, draft, onChange }: Props) {
  const chosen = draft.order.filter((id) => id && id !== NO_CHOICE);
  const remaining = payload.size - chosen.length;

  const title =
    remaining > 0
      ? `Tik de top ${payload.size} op volgorde (nog ${remaining})`
      : `Jouw top ${payload.size}`;

  const toggle = (id: string) => {
    if (chosen.includes(id)) {
      onChange({
        ...draft,
        order: chosen.filter((candidate) => candidate !== id),
      });
      return;
    }

    if (chosen.length >= payload.size) {
      return;
    }

    onChange({ ...draft, order: [...chosen, id] });
  };

  return (
    <Section title={title}>
      {payload.options.map((option) => {
        const position = chosen.indexOf(option.id);
        const isChosen = position >= 0;

        return (
          <NavRow
            key={option.id}
            title={option.label}
            leadingText={isChosen ? ordinal(position + 1) : undefined}
            highlighted={isChosen}
            selected={isChosen}
            onPress={() => toggle(option.id)}
          />
        );
      })}
    </Section>
  );
}
