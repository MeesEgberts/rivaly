import type { SFSymbol } from "sf-symbols-typescript";

import { CardHeader } from "@/components/cards/card-header";
import { MatchScoreRow } from "@/components/match/match-score-row";
import { InsetCard } from "@/components/ui/inset-card";
import {
  matchProgress,
  progressLabel,
  type MatchRowData,
} from "@/utils/match-rows";

interface Props {
  title: string;
  matches: MatchRowData[];
  /** Met een icoon krijgt de kaart een kop met voortgang (knock-outrondes). */
  icon?: SFSymbol;
}

export function MatchdayDayCard({ title, matches, icon }: Props) {
  const { open, predicted } = matchProgress(matches);

  const header = icon ? (
    <CardHeader
      icon={icon}
      title={title}
      trailing={progressLabel(matches)}
      isComplete={open > 0 && predicted === open}
    />
  ) : undefined;

  return (
    <InsetCard title={icon ? undefined : title} header={header}>
      {matches.map((match, index) => (
        <MatchScoreRow
          key={match.fixtureId}
          match={match}
          isLast={index === matches.length - 1}
        />
      ))}
    </InsetCard>
  );
}
