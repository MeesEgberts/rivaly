import { PODIUM_COLORS } from "./cycling-colors";

/** Kleur van het plekrondje: goud, zilver, brons, daarna grijs. */
export function medalColor(position: number): string {
  return PODIUM_COLORS[position] ?? "#8E8E93";
}
