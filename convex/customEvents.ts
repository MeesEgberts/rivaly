import { ConvexError, v } from "convex/values";

import { stageProfileValidator } from "../modules/cycling/stage-profile";
import { footballStageKinds } from "../modules/football/module";
import { getPreset } from "../modules/registry";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { requirePouleAdmin, requireUser } from "./lib/auth";
import { CYCLING_SPORT, insertOneDayRace } from "./lib/cyclingRace";
import { uniqueSlug } from "./lib/slug";

/**
 * Wedstrijden die een poule zelf aanmaakt (eigen koers, eigen voetbal-
 * wedstrijd). Ze zijn privé en horen bij één poule; de eigenaar en
 * beheerders van die poule voeren de uitslag in. Een platformbeheerder
 * gebruikt dezelfde bouwer om een wedstrijd in de catalogus te zetten.
 */

const MAX_EVENTS_PER_POULE = 20;
const MIN_FAVOURITES = 3;
const MAX_FAVOURITES = 40;

/** Waar de nieuwe wedstrijd terechtkomt: in een poule, of in de catalogus. */
const destinationValidator = {
  pouleId: v.optional(v.id("poules")),
  /** Alleen beheerders: zet de wedstrijd in de publieke catalogus. */
  publish: v.optional(v.boolean()),
  presetKey: v.optional(v.string()),
};

interface Destination {
  visibility: Doc<"events">["visibility"];
  ownerPouleId?: Id<"poules">;
  createdBy: Id<"users">;
  /** Na het aanmaken koppelen aan deze poule met deze puntentelling. */
  link: { pouleId: Id<"poules">; presetKey: string } | null;
}

async function resolveDestination(
  ctx: MutationCtx,
  moduleKey: string,
  args: { pouleId?: Id<"poules">; publish?: boolean; presetKey?: string },
): Promise<Destination> {
  const user = await requireUser(ctx);

  if (args.publish) {
    if (!user.isAdmin) {
      throw new ConvexError(
        "Alleen een beheerder mag wedstrijden in de catalogus zetten.",
      );
    }

    return { visibility: "public", createdBy: user._id, link: null };
  }

  if (!args.pouleId) {
    throw new ConvexError("Kies een poule voor deze wedstrijd.");
  }

  await requirePouleAdmin(ctx, args.pouleId, user._id);

  const presetKey = args.presetKey ?? "classic";
  getPreset(moduleKey, presetKey);

  const links = await ctx.db
    .query("pouleEvents")
    .withIndex("by_poule", (q) => q.eq("pouleId", args.pouleId!))
    .take(MAX_EVENTS_PER_POULE);

  if (links.length >= MAX_EVENTS_PER_POULE) {
    throw new ConvexError(
      `Een poule kan maximaal ${MAX_EVENTS_PER_POULE} evenementen bevatten.`,
    );
  }

  return {
    visibility: "private",
    ownerPouleId: args.pouleId,
    createdBy: user._id,
    link: { pouleId: args.pouleId, presetKey },
  };
}

async function linkToPoule(
  ctx: MutationCtx,
  eventId: Id<"events">,
  destination: Destination,
) {
  if (destination.link) {
    await ctx.db.insert("pouleEvents", {
      pouleId: destination.link.pouleId,
      eventId,
      presetKey: destination.link.presetKey,
    });
  }
}

function requireName(name: string, what: string): string {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    throw new ConvexError(`Geef ${what} een naam van minimaal 2 tekens.`);
  }

  return trimmed;
}

function requireFuture(startsAt: number) {
  if (!Number.isFinite(startsAt) || startsAt <= Date.now()) {
    throw new ConvexError("De starttijd moet in de toekomst liggen.");
  }
}

/** Eendagskoers: podium uit alle renners, optioneel de Nederlandse vragen. */
export const createRace = mutation({
  args: {
    ...destinationValidator,
    name: v.string(),
    startsAt: v.number(),
    route: v.optional(v.string()),
    distanceKm: v.optional(v.number()),
    profile: v.optional(stageProfileValidator),
    favouriteIds: v.array(v.id("athletes")),
    includeDutchQuestions: v.boolean(),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const destination = await resolveDestination(ctx, CYCLING_SPORT, args);
    const name = requireName(args.name, "de koers");
    requireFuture(args.startsAt);

    const uniqueIds = [...new Set(args.favouriteIds)];

    if (uniqueIds.length < MIN_FAVOURITES) {
      throw new ConvexError(
        `Kies minimaal ${MIN_FAVOURITES} favorieten voor het podium.`,
      );
    }

    if (uniqueIds.length > MAX_FAVOURITES) {
      throw new ConvexError(`Kies maximaal ${MAX_FAVOURITES} favorieten.`);
    }

    const favourites = [];

    for (const id of uniqueIds) {
      const athlete = await ctx.db.get("athletes", id);

      if (!athlete || athlete.sport !== CYCLING_SPORT) {
        throw new ConvexError("Een van de favorieten is geen renner.");
      }

      favourites.push({ id, label: athlete.name, nation: athlete.nation });
    }

    const route = args.route?.trim() || undefined;

    const eventId = await insertOneDayRace(ctx, {
      name,
      slug: await uniqueSlug(ctx, name),
      startsAt: args.startsAt,
      visibility: destination.visibility,
      ownerPouleId: destination.ownerPouleId,
      createdBy: destination.createdBy,
      series: [],
      details: {
        route,
        distanceKm: args.distanceKm,
        profile: args.profile,
      },
      favourites,
      includeDutchQuestions: args.includeDutchQuestions,
    });

    await linkToPoule(ctx, eventId, destination);

    return eventId;
  },
});

const teamValidator = v.object({
  name: v.string(),
  /** Korte code voor de badge, bijv. "AJA" of "NED". */
  code: v.string(),
});

/** Eén voetbalwedstrijd: thuis tegen uit, uitslag voorspellen. */
export const createMatch = mutation({
  args: {
    ...destinationValidator,
    home: teamValidator,
    away: teamValidator,
    startsAt: v.number(),
    /** Kan de wedstrijd gelijk eindigen? Nee bij een knock-outwedstrijd. */
    allowDraw: v.boolean(),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const destination = await resolveDestination(ctx, "football", args);
    requireFuture(args.startsAt);

    const home = normalizeTeam(args.home);
    const away = normalizeTeam(args.away);

    if (home.code === away.code) {
      throw new ConvexError("Geef de twee teams een verschillende code.");
    }

    const name = `${home.name} – ${away.name}`;

    const eventId = await ctx.db.insert("events", {
      moduleKey: "football",
      name,
      slug: await uniqueSlug(ctx, name),
      startsAt: args.startsAt,
      endsAt: args.startsAt + 2 * 60 * 60 * 1000,
      status: "upcoming",
      visibility: destination.visibility,
      ownerPouleId: destination.ownerPouleId,
      createdBy: destination.createdBy,
      meta: { shortName: `${home.code} – ${away.code}` },
    });

    const homeId = await ctx.db.insert("participants", { eventId, ...home });
    const awayId = await ctx.db.insert("participants", { eventId, ...away });

    const stageId = await ctx.db.insert("stages", {
      eventId,
      key: "match",
      name: "Wedstrijd",
      order: 0,
      kind: footballStageKinds.matchday,
    });

    await ctx.db.insert("fixtures", {
      eventId,
      stageId,
      type: "score",
      order: 0,
      label: `${home.code} – ${away.code}`,
      startsAt: args.startsAt,
      locksAt: args.startsAt,
      status: "scheduled",
      payload: { type: "score", homeId, awayId, allowDraw: args.allowDraw },
    });

    await linkToPoule(ctx, eventId, destination);

    return eventId;
  },
});

function normalizeTeam(team: { name: string; code: string }) {
  const name = requireName(team.name, "elk team");
  const code = team.code.trim().toUpperCase() || name.slice(0, 3).toUpperCase();

  if (code.length < 2 || code.length > 4) {
    throw new ConvexError("Een teamcode heeft 2 tot 4 tekens, bijv. AJA.");
  }

  return { name, code };
}
