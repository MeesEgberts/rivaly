import { v } from "convex/values";

import type { BracketPayload } from "../modules/fixture-types/bracket";
import { footballStageKinds } from "../modules/football/module";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

interface SeedTeam {
  name: string;
  code: string;
  group?: string;
}

const CUP_TEAMS: SeedTeam[] = [
  { name: "Nederland", code: "NED", group: "A" },
  { name: "Duitsland", code: "GER", group: "A" },
  { name: "Schotland", code: "SCO", group: "A" },
  { name: "Zwitserland", code: "SUI", group: "A" },
  { name: "Spanje", code: "ESP", group: "B" },
  { name: "Italië", code: "ITA", group: "B" },
  { name: "Kroatië", code: "CRO", group: "B" },
  { name: "Albanië", code: "ALB", group: "B" },
  { name: "Engeland", code: "ENG", group: "C" },
  { name: "Denemarken", code: "DEN", group: "C" },
  { name: "Servië", code: "SRB", group: "C" },
  { name: "Slovenië", code: "SVN", group: "C" },
  { name: "Frankrijk", code: "FRA", group: "D" },
  { name: "Portugal", code: "POR", group: "D" },
  { name: "België", code: "BEL", group: "D" },
  { name: "Oostenrijk", code: "AUT", group: "D" },
];

const CUP_GROUPS = ["A", "B", "C", "D"] as const;

const EREDIVISIE_TEAMS: SeedTeam[] = [
  { name: "Ajax", code: "AJA" },
  { name: "PSV", code: "PSV" },
  { name: "Feyenoord", code: "FEY" },
  { name: "AZ", code: "AZ" },
  { name: "FC Twente", code: "TWE" },
  { name: "FC Utrecht", code: "UTR" },
  { name: "NEC", code: "NEC" },
  { name: "sc Heerenveen", code: "HEE" },
  { name: "Go Ahead Eagles", code: "GAE" },
  { name: "Sparta Rotterdam", code: "SPA" },
  { name: "Fortuna Sittard", code: "FOR" },
  { name: "PEC Zwolle", code: "PEC" },
  { name: "Heracles", code: "HER" },
  { name: "NAC Breda", code: "NAC" },
  { name: "FC Groningen", code: "GRO" },
  { name: "Willem II", code: "WIL" },
  { name: "FC Volendam", code: "VOL" },
  { name: "Excelsior", code: "EXC" },
];

const TOPSCORERS = [
  "Luuk de Jong",
  "Brian Brobbey",
  "Ayase Ueda",
  "Troy Parrott",
  "Sem Steijn",
  "Ricky van Wolfswinkel",
];

function roundRobin<T>(items: T[]): [T, T][] {
  const pairs: [T, T][] = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push([items[i], items[j]]);
    }
  }

  return pairs;
}

/** Cirkelmethode: speelronde `round` voor een even aantal teams. */
function matchdayPairs<T>(items: T[], round: number): [T, T][] {
  const fixed = items[0];
  const rotating = items.slice(1);
  const shift = round % rotating.length;
  const rotated = [...rotating.slice(shift), ...rotating.slice(0, shift)];
  const lineup = [fixed, ...rotated];
  const half = lineup.length / 2;
  const pairs: [T, T][] = [];

  for (let index = 0; index < half; index += 1) {
    const home = lineup[index];
    const away = lineup[lineup.length - 1 - index];
    pairs.push(round % 2 === 0 ? [home, away] : [away, home]);
  }

  return pairs;
}

export async function firstAdminOrUser(ctx: MutationCtx): Promise<Id<"users">> {
  const users = await ctx.db.query("users").take(50);
  const admin = users.find((user) => user.isAdmin);
  const creator = admin ?? users[0];

  if (!creator) {
    throw new Error("Log eerst één keer in met de app, zodat er een gebruiker bestaat.");
  }

  return creator._id;
}

async function insertTeams(
  ctx: MutationCtx,
  eventId: Id<"events">,
  teams: SeedTeam[],
): Promise<Map<string, Id<"participants">>> {
  const ids = new Map<string, Id<"participants">>();

  for (const team of teams) {
    const id = await ctx.db.insert("participants", {
      eventId,
      name: team.name,
      shortName: team.name,
      code: team.code,
      groupKey: team.group,
    });

    ids.set(team.code, id);
  }

  return ids;
}

/** Kwartfinales 1A–2B, 1C–2D, 1B–2A, 1D–2C; daarna halve finales en finale. */
function cupBracket(teamIds: Map<string, Id<"participants">>): BracketPayload {
  const groupSlot = (group: string, position: number) => ({
    kind: "group" as const,
    group,
    position,
  });
  const winnerOf = (matchId: string) => ({ kind: "winner" as const, matchId });

  return {
    type: "bracket",
    groups: CUP_GROUPS.map((group) => ({
      key: group,
      name: `Groep ${group}`,
      teamIds: CUP_TEAMS.filter((team) => team.group === group).map(
        (team) => teamIds.get(team.code)!,
      ),
    })),
    rounds: [
      {
        key: "qf",
        name: "Kwartfinale",
        matches: [
          { id: "qf1", home: groupSlot("A", 1), away: groupSlot("B", 2) },
          { id: "qf2", home: groupSlot("C", 1), away: groupSlot("D", 2) },
          { id: "qf3", home: groupSlot("B", 1), away: groupSlot("A", 2) },
          { id: "qf4", home: groupSlot("D", 1), away: groupSlot("C", 2) },
        ],
      },
      {
        key: "sf",
        name: "Halve finale",
        matches: [
          { id: "sf1", home: winnerOf("qf1"), away: winnerOf("qf2") },
          { id: "sf2", home: winnerOf("qf3"), away: winnerOf("qf4") },
        ],
      },
      {
        key: "final",
        name: "Finale",
        matches: [{ id: "final", home: winnerOf("sf1"), away: winnerOf("sf2") }],
      },
    ],
  };
}

/**
 * Testtoernooi met 16 landen in vier groepen, een vooraf in te vullen
 * knock-outschema (kwartfinales tot finale) en bonusvragen. De eerste
 * wedstrijd begint over twee uur, daarna elke drie uur één.
 *
 * Draaien: `npx convex run seed:testCup`
 */
export const testCup = internalMutation({
  args: { startInHours: v.optional(v.number()) },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const createdBy = await firstAdminOrUser(ctx);
    const now = Date.now();
    const firstKickoff = now + (args.startInHours ?? 2) * HOUR;

    const eventId = await ctx.db.insert("events", {
      moduleKey: "football",
      name: "Rivaly Test Cup",
      slug: `rivaly-test-cup-${now}`,
      startsAt: firstKickoff,
      endsAt: firstKickoff + 40 * 3 * HOUR,
      status: "upcoming",
      visibility: "public",
      createdBy,
      meta: { shortName: "Test Cup" },
    });

    const teamIds = await insertTeams(ctx, eventId, CUP_TEAMS);

    let stageOrder = 1;
    const groupStages = new Map<string, Id<"stages">>();

    for (const group of CUP_GROUPS) {
      const stageId = await ctx.db.insert("stages", {
        eventId,
        key: `group-${group.toLowerCase()}`,
        name: `Groep ${group}`,
        order: stageOrder,
        kind: footballStageKinds.group,
      });

      groupStages.set(group, stageId);
      stageOrder += 1;
    }

    const bracketStage = await ctx.db.insert("stages", {
      eventId,
      key: "bracket",
      name: "Knock-outschema",
      order: stageOrder,
      kind: footballStageKinds.bracket,
    });
    stageOrder += 1;

    const bonusStage = await ctx.db.insert("stages", {
      eventId,
      key: "bonus",
      name: "Bonusvragen",
      order: stageOrder,
      kind: footballStageKinds.bonus,
    });

    let fixtureOrder = 1;
    let kickoff = firstKickoff;

    // Speeldag voor speeldag, zodat alle groepen door elkaar spelen.
    const groupPairs = CUP_GROUPS.map((group) =>
      roundRobin(CUP_TEAMS.filter((team) => team.group === group).map((team) => team.code)),
    );

    for (let index = 0; index < groupPairs[0].length; index += 1) {
      for (let groupIndex = 0; groupIndex < CUP_GROUPS.length; groupIndex += 1) {
        const [home, away] = groupPairs[groupIndex][index];

        await ctx.db.insert("fixtures", {
          eventId,
          stageId: groupStages.get(CUP_GROUPS[groupIndex])!,
          type: "score",
          order: fixtureOrder,
          label: `${home} – ${away}`,
          startsAt: kickoff,
          locksAt: kickoff,
          status: "scheduled",
          payload: {
            type: "score",
            homeId: teamIds.get(home)!,
            awayId: teamIds.get(away)!,
            allowDraw: true,
          },
        });

        fixtureOrder += 1;
        kickoff += 3 * HOUR;
      }
    }

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: bracketStage,
      type: "bracket",
      order: fixtureOrder,
      label: "Jouw knock-outschema",
      startsAt: firstKickoff,
      locksAt: firstKickoff,
      status: "scheduled",
      payload: cupBracket(teamIds),
    });
    fixtureOrder += 1;

    const teamOptions = CUP_TEAMS.map((team) => ({
      id: teamIds.get(team.code)!,
      label: team.name,
    }));

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: bonusStage,
      type: "pick",
      order: fixtureOrder,
      label: "Welk land maakt de meeste goals?",
      details: { icon: "flame.fill" },
      startsAt: firstKickoff,
      locksAt: firstKickoff,
      status: "scheduled",
      payload: { type: "pick", options: teamOptions },
    });
    fixtureOrder += 1;

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: bonusStage,
      type: "numeric",
      order: fixtureOrder,
      label: "Totaal aantal goals in de groepsfase",
      details: { icon: "number" },
      startsAt: firstKickoff,
      locksAt: firstKickoff,
      status: "scheduled",
      payload: { type: "numeric", unit: "goals", min: 0, max: 150, step: 1 },
    });

    return eventId;
  },
});

/**
 * Eredivisie-seizoen met drie speelrondes van negen wedstrijden en
 * seizoensvragen. Speelronde 1 begint over twee uur, de volgende rondes een
 * en twee weken later.
 *
 * Draaien: `npx convex run seed:eredivisie`
 */
export const eredivisie = internalMutation({
  args: { startInHours: v.optional(v.number()), rounds: v.optional(v.number()) },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const createdBy = await firstAdminOrUser(ctx);
    const now = Date.now();
    const firstKickoff = now + (args.startInHours ?? 2) * HOUR;
    const roundCount = args.rounds ?? 3;

    const eventId = await ctx.db.insert("events", {
      moduleKey: "football",
      name: "Eredivisie 2026/27",
      slug: `eredivisie-${now}`,
      startsAt: firstKickoff,
      endsAt: firstKickoff + roundCount * 7 * DAY,
      status: "upcoming",
      visibility: "public",
      createdBy,
      meta: { shortName: "Eredivisie" },
    });

    const teamIds = await insertTeams(ctx, eventId, EREDIVISIE_TEAMS);
    const codes = EREDIVISIE_TEAMS.map((team) => team.code);

    let fixtureOrder = 1;

    for (let round = 0; round < roundCount; round += 1) {
      const stageId = await ctx.db.insert("stages", {
        eventId,
        key: `md-${round + 1}`,
        name: `Speelronde ${round + 1}`,
        order: round + 1,
        kind: footballStageKinds.matchday,
      });

      const roundStart = firstKickoff + round * 7 * DAY;
      const pairs = matchdayPairs(codes, round);

      for (let index = 0; index < pairs.length; index += 1) {
        const [home, away] = pairs[index];
        // Drie wedstrijden op dag 1, de rest verspreid over dag 2.
        const kickoff =
          index < 3 ? roundStart + index * 2 * HOUR : roundStart + DAY + (index - 3) * 2 * HOUR;

        await ctx.db.insert("fixtures", {
          eventId,
          stageId,
          type: "score",
          order: fixtureOrder,
          label: `${home} – ${away}`,
          startsAt: kickoff,
          locksAt: kickoff,
          status: "scheduled",
          payload: {
            type: "score",
            homeId: teamIds.get(home)!,
            awayId: teamIds.get(away)!,
            allowDraw: true,
          },
        });

        fixtureOrder += 1;
      }
    }

    const bonusStage = await ctx.db.insert("stages", {
      eventId,
      key: "season",
      name: "Seizoensvragen",
      order: roundCount + 1,
      kind: footballStageKinds.bonus,
    });

    const teamOptions = EREDIVISIE_TEAMS.map((team) => ({
      id: teamIds.get(team.code)!,
      label: team.name,
    }));

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: bonusStage,
      type: "pick",
      order: fixtureOrder,
      label: "Wie wordt kampioen?",
      details: { icon: "trophy.fill" },
      startsAt: firstKickoff,
      locksAt: firstKickoff,
      status: "scheduled",
      payload: { type: "pick", options: teamOptions },
    });
    fixtureOrder += 1;

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: bonusStage,
      type: "ranking",
      order: fixtureOrder,
      label: "Top 3 van de eindstand",
      details: { icon: "list.number" },
      startsAt: firstKickoff,
      locksAt: firstKickoff,
      status: "scheduled",
      payload: { type: "ranking", size: 3, options: teamOptions },
    });
    fixtureOrder += 1;

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: bonusStage,
      type: "pick",
      order: fixtureOrder,
      label: "Wie wordt topscorer?",
      details: { icon: "soccerball" },
      startsAt: firstKickoff,
      locksAt: firstKickoff,
      status: "scheduled",
      payload: {
        type: "pick",
        options: TOPSCORERS.map((name, index) => ({ id: `player-${index + 1}`, label: name })),
      },
    });

    return eventId;
  },
});

/**
 * Koppelt een evenement aan alle bestaande poules, handig tijdens het
 * testen: `npx convex run seed:linkToAllPoules '{"eventId":"..."}'`
 */
export const linkToAllPoules = internalMutation({
  args: { eventId: v.id("events") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const poules = await ctx.db.query("poules").take(100);
    let linked = 0;

    for (const poule of poules) {
      const existing = await ctx.db
        .query("pouleEvents")
        .withIndex("by_poule_and_event", (q) =>
          q.eq("pouleId", poule._id).eq("eventId", args.eventId),
        )
        .unique();

      if (existing) {
        continue;
      }

      await ctx.db.insert("pouleEvents", {
        pouleId: poule._id,
        eventId: args.eventId,
        presetKey: "classic",
      });
      linked += 1;
    }

    return linked;
  },
});

/** Maakt de ingelogde (of eerste) gebruiker platformbeheerder: `npx convex run seed:makeAdmin '{"email":"..."}'` */
export const makeAdmin = internalMutation({
  args: { email: v.optional(v.string()), userId: v.optional(v.id("users")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").take(200);
    const user = args.userId
      ? users.find((candidate) => candidate._id === args.userId)
      : users.find((candidate) => candidate.email === args.email);

    if (!user) {
      throw new Error(
        `Geen gebruiker gevonden (${args.email ?? args.userId ?? "geen criterium"}). Bekijk de users-tabel met: npx convex data users`,
      );
    }

    await ctx.db.patch("users", user._id, { isAdmin: true });
    return null;
  },
});
