/**
 * Rekenwerk voor een sleepbare lijst met vaste rijhoogte. Alles is een
 * worklet, zodat het tijdens het slepen op de UI-thread draait.
 */

export type Positions = Record<string, number>;

export function positionsFromOrder(order: string[]): Positions {
  "worklet";

  const positions: Positions = {};

  order.forEach((id, index) => {
    positions[id] = index;
  });

  return positions;
}

export function orderFromPositions(positions: Positions): string[] {
  "worklet";

  return Object.keys(positions).sort((a, b) => positions[a] - positions[b]);
}

export function clampIndex(value: number, count: number): number {
  "worklet";

  return Math.max(0, Math.min(count - 1, value));
}

/** Zet `id` op `target` en schuift de rest één plek op, zoals bij slepen. */
export function moveTo(
  positions: Positions,
  id: string,
  target: number,
): Positions {
  "worklet";

  const order = orderFromPositions(positions).filter(
    (candidate) => candidate !== id,
  );
  order.splice(target, 0, id);

  return positionsFromOrder(order);
}
