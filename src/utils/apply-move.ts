/**
 * Past een SwiftUI-`onMove` toe op een lijst. `destination` is de index
 * vóór het weghalen van de verplaatste items, zoals SwiftUI hem doorgeeft.
 */
export function applyMove<T>(
  items: T[],
  sourceIndices: number[],
  destination: number,
): T[] {
  const moving = sourceIndices.map((index) => items[index]);
  const remaining = items.filter((_, index) => !sourceIndices.includes(index));
  const shift = sourceIndices.filter((index) => index < destination).length;
  const target = destination - shift;

  return [...remaining.slice(0, target), ...moving, ...remaining.slice(target)];
}
