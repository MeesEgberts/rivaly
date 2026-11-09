import { StyleSheet, View } from "react-native";

import type { ResolvedRound } from "@modules/fixture-types/bracket-tree";
import { useAppColors } from "@/hooks/use-app-colors";

import { CONNECTOR_WIDTH, matchCenter } from "@/utils/bracket-layout";

interface Props {
  /** De ronde links van de verbinding. */
  round: ResolvedRound;
  roundIndex: number;
  height: number;
}

const LINE = 2;

/**
 * Lijnen tussen twee rondes. Een lijn kleurt mee zodra je de winnaar van
 * die wedstrijd hebt gekozen, zodat je het pad van je kampioen ziet.
 */
export function BracketConnector({ round, roundIndex, height }: Props) {
  const colors = useAppColors();
  const half = CONNECTOR_WIDTH / 2;
  const pairs = Math.ceil(round.matches.length / 2);

  const lineColor = (picked: boolean) =>
    picked ? colors.accent : colors.separator;

  return (
    <View style={{ width: CONNECTOR_WIDTH, height }}>
      {Array.from({ length: pairs }, (_, pairIndex) => {
        const upper = round.matches[pairIndex * 2];
        const lower = round.matches[pairIndex * 2 + 1];
        const upperY = matchCenter(roundIndex, pairIndex * 2);
        const lowerY = lower
          ? matchCenter(roundIndex, pairIndex * 2 + 1)
          : upperY;
        // Zonder tweede wedstrijd (finale → beker) loopt de lijn recht door.
        const nextY = lower ? matchCenter(roundIndex + 1, pairIndex) : upperY;
        const upperPicked = upper?.winner != null;
        const lowerPicked = lower?.winner != null;

        return (
          <View key={pairIndex} style={StyleSheet.absoluteFill}>
            <View
              style={[
                styles.horizontal,
                {
                  top: upperY - LINE / 2,
                  width: half,
                  backgroundColor: lineColor(upperPicked),
                },
              ]}
            />
            <View
              style={[
                styles.vertical,
                {
                  left: half - LINE / 2,
                  top: upperY,
                  height: nextY - upperY,
                  backgroundColor: lineColor(upperPicked),
                },
              ]}
            />
            {lower ? (
              <>
                <View
                  style={[
                    styles.horizontal,
                    {
                      top: lowerY - LINE / 2,
                      width: half,
                      backgroundColor: lineColor(lowerPicked),
                    },
                  ]}
                />
                <View
                  style={[
                    styles.vertical,
                    {
                      left: half - LINE / 2,
                      top: nextY,
                      height: lowerY - nextY,
                      backgroundColor: lineColor(lowerPicked),
                    },
                  ]}
                />
              </>
            ) : null}
            <View
              style={[
                styles.horizontal,
                {
                  left: half,
                  top: nextY - LINE / 2,
                  width: half,
                  backgroundColor: lineColor(upperPicked || lowerPicked),
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  horizontal: { position: "absolute", left: 0, height: LINE, borderRadius: 1 },
  vertical: { position: "absolute", width: LINE, borderRadius: 1 },
});
