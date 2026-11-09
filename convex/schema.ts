import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  fixturePayloadValidator,
  fixturePredictionValidator,
  fixtureResultValidator,
  fixtureTypeKeyValidator,
  rulesOverridesValidator,
} from "../modules/validators";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),

  poules: defineTable({
    name: v.string(),
    emoji: v.optional(v.string()),
    ownerId: v.id("users"),
    inviteCode: v.string(),
    status: v.union(v.literal("open"), v.literal("archived")),
    settings: v.object({
      revealPredictions: v.union(v.literal("afterLock"), v.literal("always")),
    }),
  })
    .index("by_inviteCode", ["inviteCode"])
    .index("by_owner", ["ownerId"]),

  pouleMembers: defineTable({
    pouleId: v.id("poules"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_poule", ["pouleId"])
    .index("by_user", ["userId"])
    .index("by_poule_and_user", ["pouleId", "userId"]),

  pouleEvents: defineTable({
    pouleId: v.id("poules"),
    eventId: v.id("events"),
    presetKey: v.string(),
    rules: v.optional(rulesOverridesValidator),
  })
    .index("by_poule", ["pouleId"])
    .index("by_event", ["eventId"])
    .index("by_poule_and_event", ["pouleId", "eventId"]),

  events: defineTable({
    moduleKey: v.string(),
    name: v.string(),
    slug: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("finished"),
    ),
    visibility: v.union(v.literal("public"), v.literal("private")),
    ownerPouleId: v.optional(v.id("poules")),
    createdBy: v.id("users"),
    meta: v.object({
      shortName: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      color: v.optional(v.string()),
    }),
  })
    .index("by_slug", ["slug"])
    .index("by_visibility_and_status", ["visibility", "status"]),

  stages: defineTable({
    eventId: v.id("events"),
    key: v.string(),
    name: v.string(),
    order: v.number(),
    kind: v.string(),
  }).index("by_event_and_order", ["eventId", "order"]),

  participants: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    shortName: v.optional(v.string()),
    code: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    groupKey: v.optional(v.string()),
  }).index("by_event", ["eventId"]),

  fixtures: defineTable({
    eventId: v.id("events"),
    stageId: v.id("stages"),
    type: fixtureTypeKeyValidator,
    order: v.number(),
    label: v.optional(v.string()),
    startsAt: v.number(),
    locksAt: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("finished"),
      v.literal("cancelled"),
    ),
    payload: fixturePayloadValidator,
    result: v.optional(fixtureResultValidator),
  })
    .index("by_event_and_order", ["eventId", "order"])
    .index("by_stage_and_order", ["stageId", "order"])
    .index("by_event_and_locksAt", ["eventId", "locksAt"]),

  predictions: defineTable({
    userId: v.id("users"),
    fixtureId: v.id("fixtures"),
    eventId: v.id("events"),
    payload: fixturePredictionValidator,
    updatedAt: v.number(),
  })
    .index("by_user_and_fixture", ["userId", "fixtureId"])
    .index("by_fixture", ["fixtureId"])
    .index("by_user_and_event", ["userId", "eventId"]),

  scores: defineTable({
    pouleId: v.id("poules"),
    userId: v.id("users"),
    fixtureId: v.id("fixtures"),
    points: v.number(),
    breakdown: v.record(v.string(), v.number()),
  })
    .index("by_poule_and_user", ["pouleId", "userId"])
    .index("by_poule_and_fixture", ["pouleId", "fixtureId"])
    .index("by_poule_and_fixture_and_user", ["pouleId", "fixtureId", "userId"]),

  standings: defineTable({
    pouleId: v.id("poules"),
    userId: v.id("users"),
    points: v.number(),
    rank: v.number(),
    stats: v.object({
      predicted: v.number(),
      exact: v.number(),
    }),
  })
    .index("by_poule_and_points", ["pouleId", "points"])
    .index("by_poule_and_user", ["pouleId", "userId"]),
});
