import { ConvexError, v } from "convex/values";

import { getModule } from "../modules/registry";
import { query } from "./_generated/server";
import { assertCanViewEvent } from "./lib/access";
import { athleteIdsOf, athletesAsParticipants } from "./lib/athletes";
import { requireUser } from "./lib/auth";

const MAX_CATALOG = 50;
const MAX_STAGES = 50;
const MAX_PARTICIPANTS = 500;
const MAX_FIXTURES = 500;

/** De catalogus waaruit een poule evenementen kiest. */
export const catalog = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);

    const upcoming = await ctx.db
      .query("events")
      .withIndex("by_visibility_and_status", (q) =>
        q.eq("visibility", "public").eq("status", "upcoming"),
      )
      .take(MAX_CATALOG);

    const live = await ctx.db
      .query("events")
      .withIndex("by_visibility_and_status", (q) =>
        q.eq("visibility", "public").eq("status", "live"),
      )
      .take(MAX_CATALOG);

    return [...live, ...upcoming]
      .sort((a, b) => a.startsAt - b.startsAt)
      .map((event) => {
        const module = getModule(event.moduleKey);

        return {
          _id: event._id,
          name: event.name,
          shortName: event.meta.shortName ?? null,
          moduleKey: event.moduleKey,
          moduleName: module.name,
          moduleIcon: module.icon,
          status: event.status,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          series: (module.series ?? [])
            .filter((series) => event.meta.series?.includes(series.key))
            .map((series) => ({
              key: series.key,
              name: series.name,
              description: series.description,
              icon: series.icon,
            })),
          presets: module.presets.map((preset) => ({
            key: preset.key,
            name: preset.name,
            description: preset.description,
          })),
        };
      });
  },
});

export const get = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const event = await ctx.db.get("events", args.eventId);

    if (!event) {
      throw new ConvexError("Evenement niet gevonden.");
    }

    await assertCanViewEvent(ctx, event, user._id);

    const stages = await ctx.db
      .query("stages")
      .withIndex("by_event_and_order", (q) => q.eq("eventId", event._id))
      .take(MAX_STAGES);

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .take(MAX_PARTICIPANTS);

    const module = getModule(event.moduleKey);

    // Atleten uit een pool (bijv. renners) staan niet bij de deelnemers van
    // het evenement; zoek de favorieten, uitslagen en mijn keuzes erbij.
    const fixtures = await ctx.db
      .query("fixtures")
      .withIndex("by_event_and_order", (q) => q.eq("eventId", event._id))
      .take(MAX_FIXTURES);
    const myPredictions = await ctx.db
      .query("predictions")
      .withIndex("by_user_and_event", (q) =>
        q.eq("userId", user._id).eq("eventId", event._id),
      )
      .take(MAX_FIXTURES);
    const predictionByFixture = new Map(
      myPredictions.map((prediction) => [
        prediction.fixtureId,
        prediction.payload,
      ]),
    );
    const athletes = await athletesAsParticipants(
      ctx,
      fixtures.flatMap((fixture) =>
        athleteIdsOf(fixture.payload, [
          fixture.result,
          predictionByFixture.get(fixture._id),
        ]),
      ),
    );

    return {
      _id: event._id,
      name: event.name,
      moduleKey: event.moduleKey,
      moduleName: module.name,
      status: event.status,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      // Reeksen in de volgorde van de module, dus de belangrijkste eerst.
      seriesNames: (module.series ?? [])
        .filter((series) => event.meta.series?.includes(series.key))
        .map((series) => series.memberName),
      stages: stages.map((stage) => ({
        _id: stage._id,
        key: stage.key,
        name: stage.name,
        order: stage.order,
        kind: stage.kind,
      })),
      participants: [
        ...participants.map((participant) => ({
          _id: participant._id as string,
          name: participant.name,
          shortName: participant.shortName ?? null,
          code: participant.code ?? null,
          imageUrl: participant.imageUrl ?? null,
          groupKey: participant.groupKey ?? null,
        })),
        ...athletes,
      ],
    };
  },
});

/** Alle onderdelen van een evenement, met de voorspelling van de gebruiker erbij. */
export const fixtures = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const event = await ctx.db.get("events", args.eventId);

    if (!event) {
      throw new ConvexError("Evenement niet gevonden.");
    }

    await assertCanViewEvent(ctx, event, user._id);

    const fixtures = await ctx.db
      .query("fixtures")
      .withIndex("by_event_and_order", (q) => q.eq("eventId", event._id))
      .take(MAX_FIXTURES);

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_user_and_event", (q) =>
        q.eq("userId", user._id).eq("eventId", event._id),
      )
      .take(MAX_FIXTURES);

    const predictionByFixture = new Map(
      predictions.map((prediction) => [
        prediction.fixtureId,
        prediction.payload,
      ]),
    );

    return fixtures.map((fixture) => ({
      _id: fixture._id,
      stageId: fixture.stageId,
      type: fixture.type,
      order: fixture.order,
      label: fixture.label ?? null,
      startsAt: fixture.startsAt,
      locksAt: fixture.locksAt,
      status: fixture.status,
      payload: fixture.payload,
      result: fixture.result ?? null,
      details: fixture.details ?? null,
      myPrediction: predictionByFixture.get(fixture._id) ?? null,
    }));
  },
});

/** Eén onderdeel met context: evenementnaam, deelnemers en mijn voorspelling. */
export const fixture = query({
  args: { fixtureId: v.id("fixtures") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const fixtureDoc = await ctx.db.get("fixtures", args.fixtureId);

    if (!fixtureDoc) {
      throw new ConvexError("Onderdeel niet gevonden.");
    }

    const event = await ctx.db.get("events", fixtureDoc.eventId);

    if (!event) {
      throw new ConvexError("Evenement niet gevonden.");
    }

    await assertCanViewEvent(ctx, event, user._id);

    const stage = await ctx.db.get("stages", fixtureDoc.stageId);

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .take(MAX_PARTICIPANTS);

    const prediction = await ctx.db
      .query("predictions")
      .withIndex("by_user_and_fixture", (q) =>
        q.eq("userId", user._id).eq("fixtureId", fixtureDoc._id),
      )
      .unique();

    return {
      _id: fixtureDoc._id,
      eventId: event._id,
      eventName: event.name,
      stageName: stage?.name ?? null,
      type: fixtureDoc.type,
      label: fixtureDoc.label ?? null,
      startsAt: fixtureDoc.startsAt,
      locksAt: fixtureDoc.locksAt,
      status: fixtureDoc.status,
      payload: fixtureDoc.payload,
      result: fixtureDoc.result ?? null,
      details: fixtureDoc.details ?? null,
      myPrediction: prediction?.payload ?? null,
      // Pool-onderdelen: atleten uit de favorieten, uitslag en mijn keuze.
      participants: [
        ...participants.map((participant) => ({
          _id: participant._id as string,
          name: participant.name,
          shortName: participant.shortName ?? null,
          code: participant.code ?? null,
        })),
        ...(await athletesAsParticipants(
          ctx,
          athleteIdsOf(fixtureDoc.payload, [
            fixtureDoc.result,
            prediction?.payload,
          ]),
        )),
      ],
    };
  },
});
