import type { FixturePayload } from "@modules/validators";
import { NavRow } from "@/components/ui/nav-row";
import { Section } from "@/components/ui/screen";
import {
  NO_CHOICE,
  type FixtureDraft,
  type FixtureFormMode,
} from "@/utils/fixture-draft";
import { ordinal } from "@/utils/format";
import { isOtherOption, predictableRankingOptions } from "@/utils/ranking";

interface Props {
  payload: Extract<FixturePayload, { type: "ranking" }>;
  draft: FixtureDraft;
  onChange: (draft: FixtureDraft) => void;
  mode: FixtureFormMode;
}

/**
 * Volgorde: tik de teams in de volgorde van eindigen. Nog eens tikken haalt
 * een team eruit; de rest schuift op. In een uitslag kan "Andere renner"
 * meerdere plekken vullen; tik hem als alles vol is om de laatste weg te halen.
 */
export function RankingFields({ payload, draft, onChange, mode }: Props) {
  const chosen = draft.order.filter((id) => id && id !== NO_CHOICE);
  const remaining = payload.size - chosen.length;
  const options =
    mode === "result" ? payload.options : predictableRankingOptions(payload);

  const title =
    remaining > 0
      ? `Tik de top ${payload.size} op volgorde (nog ${remaining})`
      : `Jouw top ${payload.size}`;

  const toggleOther = (id: string) => {
    if (chosen.length < payload.size) {
      onChange({ ...draft, order: [...chosen, id] });
      return;
    }

    const lastIndex = chosen.lastIndexOf(id);

    if (lastIndex >= 0) {
      onChange({
        ...draft,
        order: chosen.filter((_, index) => index !== lastIndex),
      });
    }
  };

  const toggle = (id: string) => {
    if (isOtherOption(id)) {
      toggleOther(id);
      return;
    }

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
      {options.map((option) => {
        const positions = chosen.flatMap((id, index) =>
          id === option.id ? [ordinal(index + 1)] : [],
        );
        const isChosen = positions.length > 0;

        return (
          <NavRow
            key={option.id}
            title={option.label}
            leadingText={isChosen ? positions.join(" ") : undefined}
            highlighted={isChosen}
            selected={isChosen}
            onPress={() => toggle(option.id)}
          />
        );
      })}
    </Section>
  );
}
