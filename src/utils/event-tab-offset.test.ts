import { describe, expect, it } from "vitest";

import { tabSwitchOffset } from "./event-tab-offset";

describe("tabSwitchOffset", () => {
  it("houdt de stand zolang de kop in beeld is", () => {
    expect(tabSwitchOffset({ fromY: 120, ownY: 900, limit: 300 })).toBe(120);
    expect(tabSwitchOffset({ fromY: -40, ownY: undefined, limit: 300 })).toBe(
      0,
    );
  });

  it("zet de tabs net onder de balk als de kop weg is", () => {
    expect(tabSwitchOffset({ fromY: 800, ownY: undefined, limit: 300 })).toBe(
      300,
    );
    expect(tabSwitchOffset({ fromY: 800, ownY: 100, limit: 300 })).toBe(300);
  });

  it("houdt de eigen plek van een tab die al verder was", () => {
    expect(tabSwitchOffset({ fromY: 800, ownY: 650, limit: 300 })).toBe(650);
  });
});
