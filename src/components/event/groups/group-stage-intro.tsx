import { StyleSheet, View } from "react-native";

import { ProgressCard } from "@/components/cards/progress-card";
import { useNow } from "@/hooks/use-now";
import { formatKickoff } from "@/utils/format";
import { formatTimeLeft } from "@/utils/prediction-cards";

interface Props {
  open: number;
  predicted: number;
  /** Aftrap van de eerstvolgende open wedstrijd, of `null`. */
  nextKickoff: number | null;
}

/** Voortgang van de groepsfase met de eerstvolgende deadline en uitleg. */
export function GroupStageIntro({ open, predicted, nextKickoff }: Props) {
  const now = useNow();

  if (open === 0 || nextKickoff === null) {
    return (
      <View style={styles.container}>
        <ProgressCard
          icon="lock.fill"
          isMuted
          title="Alle groepswedstrijden zijn gesloten"
          answered={predicted}
          total={open}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressCard
        icon="soccerball"
        title={`${predicted} van ${open} ingevuld`}
        subtitle={`Volgende sluit ${formatKickoff(nextKickoff)} · ${formatTimeLeft(nextKickoff, now)}`}
        answered={predicted}
        total={open}
        footnote="Tik op een vak en tik de cijfers. Je stand per groep rekent direct mee en vult straks je knock-outschema."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 16 },
});
