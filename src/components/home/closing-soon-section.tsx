import { router } from "expo-router";

import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { Chip } from "@/components/cards/chip";
import { SectionTitle } from "@/components/cards/section-title";
import { QuestionVisual } from "@/components/cards/question-visual";
import { useAppColors } from "@/hooks/use-app-colors";
import { isSoon, openItemHref, type OpenItem } from "@/utils/home";
import { formatTimeLeft } from "@/utils/prediction-cards";

interface Props {
  items: OpenItem[];
  now: number;
}

/** De volgende onderdelen die je nog moet invullen, met hoe lang je nog hebt. */
export function ClosingSoonSection({ items, now }: Props) {
  const colors = useAppColors();

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <SectionTitle>Daarna</SectionTitle>
      <Card isFlush>
        {items.map((item, index) => (
          <CardRow
            key={item.fixtureId}
            leading={<QuestionVisual type={item.type} details={item.details} />}
            title={item.label ?? "Onderdeel"}
            subtitle={item.eventName}
            trailing={
              <Chip
                text={formatTimeLeft(item.locksAt, now)}
                tint={isSoon(item.locksAt, now) ? colors.accent : undefined}
              />
            }
            onPress={() => router.push(openItemHref(item))}
            isLast={index === items.length - 1}
          />
        ))}
      </Card>
    </>
  );
}
