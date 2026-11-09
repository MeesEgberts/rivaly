/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);

  const ids = await t.run(async (ctx) => {
    const ownerId = await ctx.db.insert("users", {
      tokenIdentifier: "owner",
      name: "Eigenaar",
    });
    const friendId = await ctx.db.insert("users", {
      tokenIdentifier: "friend",
      name: "Vriend",
    });
    const pouleId = await ctx.db.insert("poules", {
      name: "Testpoule",
      ownerId,
      inviteCode: "ABC123",
      status: "open",
      settings: { revealPredictions: "afterLock" },
    });
    await ctx.db.insert("pouleMembers", {
      pouleId,
      userId: ownerId,
      role: "owner",
      joinedAt: 0,
    });

    const eventBase = {
      moduleKey: "cycling",
      startsAt: 0,
      endsAt: 0,
      status: "upcoming" as const,
      createdBy: ownerId,
      meta: {},
    };
    const catalogEventId = await ctx.db.insert("events", {
      ...eventBase,
      name: "Catalogus",
      slug: "catalogus",
      visibility: "public",
    });
    const customEventId = await ctx.db.insert("events", {
      ...eventBase,
      name: "Eigen koers",
      slug: "eigen-koers",
      visibility: "private",
      ownerPouleId: pouleId,
    });
    await ctx.db.insert("stages", {
      eventId: customEventId,
      key: "race",
      name: "Koers",
      order: 0,
      kind: "race",
    });
    await ctx.db.insert("participants", {
      eventId: customEventId,
      name: "Renner",
    });

    for (const eventId of [catalogEventId, customEventId]) {
      await ctx.db.insert("pouleEvents", {
        pouleId,
        eventId,
        presetKey: "classic",
      });
    }

    return { ownerId, friendId, pouleId, catalogEventId, customEventId };
  });

  return { t, ...ids };
}

describe("poules.remove", () => {
  test("eigenaar verwijdert een poule waar alleen hij in zit", async () => {
    const { t, pouleId, catalogEventId, customEventId } = await setup();

    await t
      .withIdentity({ tokenIdentifier: "owner" })
      .mutation(api.poules.remove, { pouleId });

    await t.run(async (ctx) => {
      expect(await ctx.db.get("poules", pouleId)).toBeNull();
      expect(await ctx.db.get("events", customEventId)).toBeNull();
      expect(await ctx.db.get("events", catalogEventId)).not.toBeNull();
      expect(await ctx.db.query("pouleMembers").collect()).toHaveLength(0);
      expect(await ctx.db.query("pouleEvents").collect()).toHaveLength(0);
      expect(await ctx.db.query("stages").collect()).toHaveLength(0);
      expect(await ctx.db.query("participants").collect()).toHaveLength(0);
    });
  });

  test("weigert als er al andere deelnemers zijn", async () => {
    const { t, pouleId, friendId } = await setup();

    await t.run(async (ctx) => {
      await ctx.db.insert("pouleMembers", {
        pouleId,
        userId: friendId,
        role: "member",
        joinedAt: 1,
      });
    });

    await expect(
      t
        .withIdentity({ tokenIdentifier: "owner" })
        .mutation(api.poules.remove, { pouleId }),
    ).rejects.toThrow();

    await t.run(async (ctx) => {
      expect(await ctx.db.get("poules", pouleId)).not.toBeNull();
    });
  });

  test("weigert als je geen eigenaar bent", async () => {
    const { t, pouleId } = await setup();

    await expect(
      t
        .withIdentity({ tokenIdentifier: "friend" })
        .mutation(api.poules.remove, { pouleId }),
    ).rejects.toThrow();
  });
});
