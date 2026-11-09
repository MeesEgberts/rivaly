import { describe, expect, it } from "vitest";

import { footballPresets } from "../football/module";
import { formatDistance, isRelayCategory } from "./categories";
import { shorttrackModule, speedskatingModule } from "./module";

describe("schaatsen", () => {
  it("deelt de preset-sleutels met voetbal, zodat sporten in één poule passen", () => {
    const football = footballPresets.map((preset) => preset.key).sort();

    for (const module of [speedskatingModule, shorttrackModule]) {
      expect(module.presets.map((preset) => preset.key).sort()).toEqual(
        football,
      );
    }
  });

  it("schrijft afstanden zoals in het Nederlands", () => {
    expect(formatDistance(500)).toBe("500 m");
    expect(formatDistance(1500)).toBe("1.500 m");
    expect(formatDistance(10000)).toBe("10.000 m");
  });

  it("herkent aflossingen", () => {
    expect(isRelayCategory("relayMixed")).toBe(true);
    expect(isRelayCategory("women")).toBe(false);
  });
});

describe("ronden", () => {
  it("rekent afstanden om naar ronden op de baan", async () => {
    const { formatLaps, lapsOf } = await import("./distance-info");

    expect(formatLaps(lapsOf("speedskating", { distanceM: 500 })!)).toBe("1¼");
    expect(formatLaps(lapsOf("speedskating", { distanceM: 5000 })!)).toBe(
      "12½",
    );
    expect(formatLaps(lapsOf("shorttrack", { distanceM: 500 })!)).toBe("4½");
    expect(lapsOf("speedskating", { format: "massstart" })).toBe(16);
    expect(lapsOf("speedskating", { format: "allround" })).toBeNull();
  });
});
