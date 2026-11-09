/**
 * Gedeelde typen voor de module-architectuur.
 *
 * Alles in `modules/` (behalve `ui/`) is pure TypeScript en wordt door zowel
 * `convex/` als `src/` geïmporteerd. Zo valideert en scoort de server met
 * dezelfde code als waarmee de client formulieren toont.
 */

export type FixtureTypeKey = "score" | "pick" | "ranking" | "numeric" | "bracket";

export interface ScoreOutcome {
  points: number;
  /** Waar de punten vandaan komen, bijv. `{ exact: 5 }` of `{ outcome: 2, goalDifference: 1 }`. */
  breakdown: Record<string, number>;
}

export interface FixtureType<Payload, Result, Prediction, Rules> {
  key: FixtureTypeKey;
  /** Nederlandse naam voor in de UI, bijv. "Uitslag". */
  name: string;
  defaultRules: Rules;
  /**
   * Controleert of een voorspelling past bij het onderdeel (bijv. gekozen
   * optie bestaat). Gooit een Error met een gebruikersvriendelijke tekst.
   */
  assertPredictionFits(payload: Payload, prediction: Prediction): void;
  /** Controleert of een uitslag past bij het onderdeel. */
  assertResultFits(payload: Payload, result: Result): void;
  score(args: {
    prediction: Prediction;
    result: Result;
    rules: Rules;
    /** Het onderdeel zelf; alleen nodig voor types die de opbouw kennen (bracket). */
    payload?: Payload;
  }): ScoreOutcome;
}

export interface ScoringPreset {
  key: string;
  name: string;
  description: string;
  /** Per onderdeeltype de regels; ontbrekende types vallen terug op de standaard. */
  rules: Partial<RulesByType>;
}

export interface SportModule {
  key: string;
  name: string;
  /** SF Symbol / Material Symbol naam voor het icoon. */
  icon: string;
  fixtureTypes: FixtureTypeKey[];
  /** Soorten fases die de UI van deze module kan weergeven. */
  stageKinds: string[];
  presets: ScoringPreset[];
}

// De concrete Rules-typen worden in de fixture-types gedefinieerd en hier
// samengebracht, zodat presets en poule-overrides één vorm hebben.
import type { BracketRules } from "./fixture-types/bracket";
import type { NumericRules } from "./fixture-types/numeric";
import type { PickRules } from "./fixture-types/pick";
import type { RankingRules } from "./fixture-types/ranking";
import type { ScoreRules } from "./fixture-types/score";

export interface RulesByType {
  score: ScoreRules;
  pick: PickRules;
  ranking: RankingRules;
  numeric: NumericRules;
  bracket: BracketRules;
}
