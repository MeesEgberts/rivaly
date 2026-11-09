import { MatchScoreRow } from "@/components/match/match-score-row";
import { InsetCard } from "@/components/ui/inset-card";
import type { MatchRowData } from "@/utils/match-rows";

interface Props {
  title: string;
  matches: MatchRowData[];
}

export function MatchdayDayCard({ title, matches }: Props) {
  return (
    <InsetCard title={title}>
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
