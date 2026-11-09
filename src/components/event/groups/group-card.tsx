import { MatchScoreRow } from "@/components/match/match-score-row";
import { InsetCard } from "@/components/ui/inset-card";
import type { MatchRowData } from "@/utils/match-rows";

import { GroupTableCard } from "./group-table-card";

interface Props {
  name: string;
  matches: MatchRowData[];
  qualifiers: number;
}

/** Eén groep: de wedstrijden, met daaronder jouw voorspelde eindstand. */
export function GroupCard({ name, matches, qualifiers }: Props) {
  return (
    <>
      <InsetCard title={name}>
        {matches.map((match, index) => (
          <MatchScoreRow
            key={match.fixtureId}
            match={match}
            isLast={index === matches.length - 1}
          />
        ))}
      </InsetCard>
      <GroupTableCard name={name} matches={matches} qualifiers={qualifiers} />
    </>
  );
}
