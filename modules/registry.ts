import { ConvexError } from "convex/values";

import { bracketFixtureType } from "./fixture-types/bracket";
import { numericFixtureType } from "./fixture-types/numeric";
import { pickFixtureType } from "./fixture-types/pick";
import { rankingFixtureType } from "./fixture-types/ranking";
import { scoreFixtureType } from "./fixture-types/score";
import { footballModule } from "./football/module";
import type {
  FixtureTypeKey,
  RulesByType,
  ScoreOutcome,
  ScoringPreset,
  SportModule,
} from "./types";
import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
  RulesOverrides,
} from "./validators";

export const fixtureTypes = {
  score: scoreFixtureType,
  pick: pickFixtureType,
  ranking: rankingFixtureType,
  numeric: numericFixtureType,
  bracket: bracketFixtureType,
} as const;

export const modules: Record<string, SportModule> = {
  [footballModule.key]: footballModule,
};

export function getModule(moduleKey: string): SportModule {
  const module = modules[moduleKey];

  if (!module) {
    throw new Error(`Onbekende sportmodule: ${moduleKey}`);
  }

  return module;
}

export function getPreset(moduleKey: string, presetKey: string): ScoringPreset {
  const module = getModule(moduleKey);
  const preset = module.presets.find((candidate) => candidate.key === presetKey);

  if (!preset) {
    throw new ConvexError(`Onbekende puntentelling "${presetKey}" voor ${module.name}.`);
  }

  return preset;
}

export const defaultRules: RulesByType = {
  score: scoreFixtureType.defaultRules,
  pick: pickFixtureType.defaultRules,
  ranking: rankingFixtureType.defaultRules,
  numeric: numericFixtureType.defaultRules,
  bracket: bracketFixtureType.defaultRules,
};

/** Standaard → preset → poule-overrides, zodat elk type altijd regels heeft. */
export function resolveRules(
  preset: ScoringPreset,
  overrides: RulesOverrides | undefined,
): RulesByType {
  return {
    score: overrides?.score ?? preset.rules.score ?? defaultRules.score,
    pick: overrides?.pick ?? preset.rules.pick ?? defaultRules.pick,
    ranking: overrides?.ranking ?? preset.rules.ranking ?? defaultRules.ranking,
    numeric: overrides?.numeric ?? preset.rules.numeric ?? defaultRules.numeric,
    bracket: overrides?.bracket ?? preset.rules.bracket ?? defaultRules.bracket,
  };
}

function assertSameType(
  fixtureType: FixtureTypeKey,
  value: { type: FixtureTypeKey },
  label: string,
) {
  if (value.type !== fixtureType) {
    throw new ConvexError(`${label} past niet bij dit soort onderdeel.`);
  }
}

export function assertPredictionFits(
  payload: FixturePayload,
  prediction: FixturePrediction,
) {
  assertSameType(payload.type, prediction, "Deze voorspelling");

  switch (payload.type) {
    case "score":
      return fixtureTypes.score.assertPredictionFits(
        payload,
        prediction as Extract<FixturePrediction, { type: "score" }>,
      );
    case "pick":
      return fixtureTypes.pick.assertPredictionFits(
        payload,
        prediction as Extract<FixturePrediction, { type: "pick" }>,
      );
    case "ranking":
      return fixtureTypes.ranking.assertPredictionFits(
        payload,
        prediction as Extract<FixturePrediction, { type: "ranking" }>,
      );
    case "numeric":
      return fixtureTypes.numeric.assertPredictionFits(
        payload,
        prediction as Extract<FixturePrediction, { type: "numeric" }>,
      );
    case "bracket":
      return fixtureTypes.bracket.assertPredictionFits(
        payload,
        prediction as Extract<FixturePrediction, { type: "bracket" }>,
      );
  }
}

export function assertResultFits(payload: FixturePayload, result: FixtureResult) {
  assertSameType(payload.type, result, "Deze uitslag");

  switch (payload.type) {
    case "score":
      return fixtureTypes.score.assertResultFits(
        payload,
        result as Extract<FixtureResult, { type: "score" }>,
      );
    case "pick":
      return fixtureTypes.pick.assertResultFits(
        payload,
        result as Extract<FixtureResult, { type: "pick" }>,
      );
    case "ranking":
      return fixtureTypes.ranking.assertResultFits(
        payload,
        result as Extract<FixtureResult, { type: "ranking" }>,
      );
    case "numeric":
      return fixtureTypes.numeric.assertResultFits(
        payload,
        result as Extract<FixtureResult, { type: "numeric" }>,
      );
    case "bracket":
      return fixtureTypes.bracket.assertResultFits(
        payload,
        result as Extract<FixtureResult, { type: "bracket" }>,
      );
  }
}

/** Rekent één voorspelling om naar punten. Werkt voor elk onderdeeltype. */
export function scorePrediction(args: {
  prediction: FixturePrediction;
  result: FixtureResult;
  rules: RulesByType;
  /** Het onderdeel; verplicht voor een toernooischema. */
  payload?: FixturePayload;
}): ScoreOutcome {
  const { prediction, result, rules, payload } = args;

  if (prediction.type !== result.type) {
    return { points: 0, breakdown: {} };
  }

  switch (result.type) {
    case "score":
      return fixtureTypes.score.score({
        prediction: prediction as Extract<FixturePrediction, { type: "score" }>,
        result,
        rules: rules.score,
      });
    case "pick":
      return fixtureTypes.pick.score({
        prediction: prediction as Extract<FixturePrediction, { type: "pick" }>,
        result,
        rules: rules.pick,
      });
    case "ranking":
      return fixtureTypes.ranking.score({
        prediction: prediction as Extract<FixturePrediction, { type: "ranking" }>,
        result,
        rules: rules.ranking,
      });
    case "numeric":
      return fixtureTypes.numeric.score({
        prediction: prediction as Extract<FixturePrediction, { type: "numeric" }>,
        result,
        rules: rules.numeric,
      });
    case "bracket":
      return fixtureTypes.bracket.score({
        prediction: prediction as Extract<FixturePrediction, { type: "bracket" }>,
        result,
        rules: rules.bracket,
        payload: payload?.type === "bracket" ? payload : undefined,
      });
  }
}
