import { describe, expect, it } from "vitest";

import { flagEmoji } from "./nations";

describe("flagEmoji", () => {
  it("zet een IOC-code om naar de vlag", () => {
    expect(flagEmoji("NED")).toBe("🇳🇱");
    expect(flagEmoji("slo")).toBe("🇸🇮");
    expect(flagEmoji("GER")).toBe("🇩🇪");
  });

  it("kent de Britse landsdelen", () => {
    expect(flagEmoji("SCO")).toBe("🏴󠁧󠁢󠁳󠁣󠁴󠁿");
  });

  it("geeft niets terug voor clubcodes of lege waarden", () => {
    expect(flagEmoji("AJA")).toBeNull();
    expect(flagEmoji(null)).toBeNull();
    expect(flagEmoji("")).toBeNull();
  });
});
