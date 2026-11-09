import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "@modules/validators";

/**
 * Het concept dat de gebruiker in het generieke formulier invult.
 * `draftToValue` zet het om naar een geldige voorspelling of uitslag en
 * gooit een Error met een leesbare melding als er iets ontbreekt.
 */
export interface FixtureDraft {
  home: number;
  away: number;
  winnerId: string;
  optionId: string;
  order: string[];
  value: number;
}

export type FixtureFormMode = "prediction" | "result";

/** Placeholder-waarde van een Picker zonder keuze. */
export const NO_CHOICE = "__none__";

export function draftFromValue(
  value: FixturePrediction | FixtureResult | null,
  payload: FixturePayload,
): FixtureDraft {
  const draft: FixtureDraft = {
    home: 0,
    away: 0,
    winnerId: "",
    optionId: "",
    order: payload.type === "ranking" ? Array(payload.size).fill("") : [],
    value: payload.type === "numeric" ? (payload.min ?? 0) : 0,
  };

  if (!value) {
    return draft;
  }

  switch (value.type) {
    case "score":
      draft.home = value.home;
      draft.away = value.away;
      draft.winnerId =
        "winnerId" in value && value.winnerId ? value.winnerId : "";
      break;
    case "pick":
      draft.optionId = value.optionId;
      break;
    case "ranking":
      draft.order = value.order;
      break;
    case "numeric":
      draft.value = value.value;
      break;
    case "bracket":
      // Een schema wordt in de bracket-builder ingevuld, niet in dit formulier.
      break;
  }

  return draft;
}

export function draftToValue(
  draft: FixtureDraft,
  payload: FixturePayload,
  mode: FixtureFormMode,
): FixturePrediction | FixtureResult {
  switch (payload.type) {
    case "score":
      return scoreFromDraft(draft, payload.allowDraw, mode);

    case "pick": {
      if (!draft.optionId || draft.optionId === NO_CHOICE) {
        throw new Error("Maak een keuze.");
      }

      return { type: "pick", optionId: draft.optionId };
    }

    case "ranking": {
      const order = draft.order.slice(0, payload.size);
      const isComplete =
        order.length === payload.size &&
        order.every((id) => id && id !== NO_CHOICE);

      if (!isComplete) {
        throw new Error(`Vul alle ${payload.size} plekken in.`);
      }

      if (new Set(order).size !== order.length) {
        throw new Error("Elke deelnemer mag maar één keer voorkomen.");
      }

      return { type: "ranking", order };
    }

    case "numeric":
      return { type: "numeric", value: draft.value };

    case "bracket":
      throw new Error("Een knock-outschema vul je in via het tabblad Schema.");
  }
}

function scoreFromDraft(
  draft: FixtureDraft,
  allowDraw: boolean,
  mode: FixtureFormMode,
): FixturePrediction | FixtureResult {
  const { home, away } = draft;
  const isDraw = home === away;

  if (allowDraw || !isDraw) {
    return { type: "score", home, away };
  }

  if (mode === "prediction") {
    throw new Error(
      "In een knock-outwedstrijd kan het niet gelijk eindigen. Kies een winnaar.",
    );
  }

  if (!draft.winnerId) {
    throw new Error(
      "Kies wie er na verlenging of strafschoppen heeft gewonnen.",
    );
  }

  return { type: "score", home, away, winnerId: draft.winnerId };
}
