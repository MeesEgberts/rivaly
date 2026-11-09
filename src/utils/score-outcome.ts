export type PredictionOutcome = "exact" | "outcome" | "wrong";

interface Score {
  home: number;
  away: number;
}

function toto(score: Score): number {
  return Math.sign(score.home - score.away);
}

/** Hoe goed een voorspelde uitslag was, los van de puntentelling van een poule. */
export function predictionOutcome(
  prediction: Score | null,
  result: Score | null,
): PredictionOutcome | null {
  if (prediction === null || result === null) {
    return null;
  }

  if (prediction.home === result.home && prediction.away === result.away) {
    return "exact";
  }

  if (toto(prediction) === toto(result)) {
    return "outcome";
  }

  return "wrong";
}

/** "Nederland wint", "Gelijkspel" of "Duitsland wint". */
export function describeToto(
  score: Score,
  homeName: string,
  awayName: string,
): string {
  const direction = toto(score);

  if (direction > 0) {
    return `${homeName} wint`;
  }

  if (direction < 0) {
    return `${awayName} wint`;
  }

  return "Gelijkspel";
}
