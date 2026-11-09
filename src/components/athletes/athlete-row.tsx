import { SymbolView } from "expo-symbols";

import { CardRow } from "@/components/cards/card-row";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

import { AthleteAvatar } from "./athlete-avatar";

interface Props {
  athlete: AthleteInfo;
  onPress: () => void;
  isLast?: boolean;
}

/** Eén atleet in een keuzelijst: foto of vlag, naam en het standaard plusicoon. */
export function AthleteRow({ athlete, onPress, isLast }: Props) {
  const colors = useAppColors();

  return (
    <CardRow
      leading={
        <AthleteAvatar
          name={athlete.name}
          imageUrl={athlete.imageUrl}
          code={athlete.code}
          size={36}
        />
      }
      title={athlete.name}
      subtitle={athlete.code ?? undefined}
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
