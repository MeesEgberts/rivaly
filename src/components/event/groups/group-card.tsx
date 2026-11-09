import { CardHeader } from "@/components/cards/card-header";
import { MatchScoreRow } from "@/components/match/match-score-row";
import { InsetCard } from "@/components/ui/inset-card";
import {
  groupLetter,
  matchProgress,
  progressLabel,
  type MatchRowData,
} from "@/utils/match-rows";

import { GroupTableCard } from "./group-table-card";

interface Props {
  name: string;
  matches: MatchRowData[];
  qualifiers: number;
}

/** Eén groep: kop met letter en voortgang, de wedstrijden en jouw stand. */
export function GroupCard({ name, matches, qualifiers }: Props) {
  const { open, predicted } = matchProgress(matches);

  return (
    <>
      <InsetCard
        header={
          <CardHeader
            letter={groupLetter(name)}
            title={name}
            trailing={progressLabel(matches)}
            isComplete={open > 0 && predicted === open}
          />
        }
      >
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
