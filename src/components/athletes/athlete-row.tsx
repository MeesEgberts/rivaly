import { SymbolView } from "expo-symbols";

import { CardRow } from "@/components/cards/card-row";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  athlete: AthleteInfo;
  /** Al gekozen: vinkje in plaats van een plusje. */
  isChosen: boolean;
  onPress: () => void;
  isLast?: boolean;
}

/** Eén atleet in een lijst: landcode, naam en een plus of vinkje. */
export function AthleteRow({ athlete, isChosen, onPress, isLast }: Props) {
  const colors = useAppColors();

  return (
    <CardRow
      leading={
        athlete.code ? (
          <TeamBadge code={athlete.code} />
        ) : (
          <SymbolBadge name="person.fill" size={28} />
        )
      }
      title={athlete.name}
      trailing={
        <SymbolView
          name={isChosen ? "checkmark.circle.fill" : "plus.circle.fill"}
          size={22}
          tintColor={(isChosen ? colors.success : colors.accent) as string}
        />
      }
      onPress={onPress}
      isLast={isLast}
      hideChevron
    />
  );
}
