import { ConvexError, v, type Infer } from "convex/values";

import type { FixtureType } from "../types";
import {
  championOf,
  resolveBracket,
  teamsInRound,
  type ResolvedRound,
} from "./bracket-tree";

/**
 * Het hele knock-outschema vooraf invullen: de volgorde per groep bepaalt
 * wie er doorgaat, daarna kies je per wedstrijd de winnaar tot er een
 * kampioen staat. Eén onderdeel voor het hele schema.
 */

/** Waar een plek in een wedstrijd vandaan komt: een groepspositie of een eerdere winnaar. */
export const bracketSlotSourceValidator = v.union(
  v.object({
    kind: v.literal("group"),
    group: v.string(),
    /** 1 = groepswinnaar. */
    position: v.number(),
  }),
  v.object({
    kind: v.literal("winner"),
    matchId: v.string(),
  }),
);

export const bracketPayloadValidator = v.object({
  type: v.literal("bracket"),
  groups: v.array(
    v.object({
      key: v.string(),
      name: v.string(),
      teamIds: v.array(v.string()),
    }),
  ),
  /**
   * Rondes van eerste knock-outronde tot finale. Wedstrijd `i` van ronde
   * `r + 1` wordt gevoed door wedstrijden `2i` en `2i + 1` van ronde `r`;
   * daar rekent de weergave mee.
   */
  rounds: v.array(
    v.object({
      key: v.string(),
      name: v.string(),
      matches: v.array(
        v.object({
          id: v.string(),
          home: bracketSlotSourceValidator,
          away: bracketSlotSourceValidator,
        }),
      ),
    }),
  ),
});

const bracketGroupOrderValidator = v.object({
  group: v.string(),
  order: v.array(v.string()),
});

const bracketPickValidator = v.object({
  matchId: v.string(),
  winnerId: v.string(),
});

/**
 * Voorspelling en uitslag hebben dezelfde vorm. Beide mogen gedeeltelijk
 * zijn: een voorspelling wordt tussentijds bewaard, een uitslag groeit mee
 * met het toernooi.
 */
export const bracketValueValidator = v.object({
  type: v.literal("bracket"),
  groups: v.array(bracketGroupOrderValidator),
  winners: v.array(bracketPickValidator),
});

export const bracketPredictionValidator = bracketValueValidator;
export const bracketResultValidator = bracketValueValidator;

export const bracketRulesValidator = v.object({
  /** Per team op precies de juiste plek in de groep. */
  groupPosition: v.number(),
  /**
   * Per team dat jij in ronde `r` zet en dat daar echt speelt. Langer dan
   * het aantal rondes mag; korter herhaalt de laatste waarde.
   */
  perRound: v.array(v.number()),
  /** Juiste kampioen. */
  champion: v.number(),
});

export type BracketSlotSource = Infer<typeof bracketSlotSourceValidator>;
export type BracketPayload = Infer<typeof bracketPayloadValidator>;
export type BracketGroupOrder = Infer<typeof bracketGroupOrderValidator>;
export type BracketValue = Infer<typeof bracketValueValidator>;
export type BracketRules = Infer<typeof bracketRulesValidator>;

function assertValidGroups(payload: BracketPayload, value: BracketValue) {
  const seen = new Set<string>();

  for (const entry of value.groups) {
    const group = payload.groups.find((candidate) => candidate.key === entry.group);

    if (!group) {
      throw new ConvexError("Een van de groepen hoort niet bij dit toernooi.");
    }

    if (seen.has(entry.group)) {
      throw new ConvexError(`${group.name} staat er twee keer in.`);
    }

    seen.add(entry.group);

    const sameTeams =
      entry.order.length === group.teamIds.length &&
      new Set(entry.order).size === entry.order.length &&
      entry.order.every((id) => group.teamIds.includes(id));

    if (!sameTeams) {
      throw new ConvexError(`Zet alle teams van ${group.name} precies één keer op volgorde.`);
    }
  }
}

function assertValidWinners(payload: BracketPayload, value: BracketValue) {
  const knownMatches = new Set(
    payload.rounds.flatMap((round) => round.matches.map((match) => match.id)),
  );
  const picked = new Set<string>();

  for (const pick of value.winners) {
    if (!knownMatches.has(pick.matchId)) {
      throw new ConvexError("Een van de wedstrijden hoort niet bij dit schema.");
    }

    if (picked.has(pick.matchId)) {
      throw new ConvexError("Per wedstrijd kun je maar één winnaar kiezen.");
    }

    picked.add(pick.matchId);
  }

  const resolved = resolveBracket(payload, value);
  const validPicks = resolved
    .flatMap((round) => round.matches)
    .filter((match) => match.winner !== null).length;

  if (validPicks !== value.winners.length) {
    throw new ConvexError("Een gekozen winnaar speelt die wedstrijd niet volgens jouw schema.");
  }
}

function pointsForRound(rules: BracketRules, roundIndex: number): number {
  if (rules.perRound.length === 0) {
    return 0;
  }

  const index = Math.min(roundIndex, rules.perRound.length - 1);

  return rules.perRound[index];
}

function scoreGroups(
  prediction: BracketValue,
  result: BracketValue,
  rules: BracketRules,
): number {
  let points = 0;

  for (const actual of result.groups) {
    const predicted = prediction.groups.find((group) => group.group === actual.group);

    if (!predicted) {
      continue;
    }

    actual.order.forEach((teamId, index) => {
      if (predicted.order[index] === teamId) {
        points += rules.groupPosition;
      }
    });
  }

  return points;
}

function scoreRounds(
  predicted: ResolvedRound[],
  actual: ResolvedRound[],
  rules: BracketRules,
): Record<string, number> {
  const breakdown: Record<string, number> = {};

  actual.forEach((round, roundIndex) => {
    const actualTeams = teamsInRound(actual, roundIndex);
    const predictedTeams = teamsInRound(predicted, roundIndex);
    let correct = 0;

    for (const teamId of predictedTeams) {
      if (actualTeams.has(teamId)) {
        correct += 1;
      }
    }

    const points = correct * pointsForRound(rules, roundIndex);

    if (points > 0) {
      breakdown[`round_${round.key}`] = points;
    }
  });

  return breakdown;
}

export const bracketFixtureType: FixtureType<
  BracketPayload,
  BracketValue,
  BracketValue,
  BracketRules
> = {
  key: "bracket",
  name: "Toernooischema",
  defaultRules: { groupPosition: 1, perRound: [2, 4, 6, 8], champion: 10 },

  assertPredictionFits(payload, prediction) {
    assertValidGroups(payload, prediction);
    assertValidWinners(payload, prediction);
  },

  assertResultFits(payload, result) {
    assertValidGroups(payload, result);
    assertValidWinners(payload, result);
  },

  score({ prediction, result, rules, payload }) {
    if (!payload) {
      throw new ConvexError("Voor een toernooischema is het schema zelf nodig om te scoren.");
    }

    const predicted = resolveBracket(payload, prediction);
    const actual = resolveBracket(payload, result);

    const breakdown = scoreRounds(predicted, actual, rules);
    const groupPoints = scoreGroups(prediction, result, rules);

    if (groupPoints > 0) {
      breakdown.groupPosition = groupPoints;
    }

    const actualChampion = championOf(actual);

    if (actualChampion !== null && actualChampion === championOf(predicted)) {
      breakdown.champion = rules.champion;
    }

    let points = 0;

    for (const value of Object.values(breakdown)) {
      points += value;
    }

    return { points, breakdown };
  },
};
