import { SymbolView } from "expo-symbols";

import { CardRow } from "@/components/cards/card-row";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  athlete: AthleteInfo;
  onPress: () => void;
  isLast?: boolean;
}

/** Eén atleet in een keuzelijst: landcode, naam en het standaard plusicoon. */
export function AthleteRow({ athlete, onPress, isLast }: Props) {
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
          name="plus.circle.fill"
          size={24}
          tintColor={colors.accent as string}
        />
      }
      onPress={onPress}
      isLast={isLast}
      hideChevron
    />
  );
}
