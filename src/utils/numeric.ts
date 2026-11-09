interface NumericBounds {
  min?: number;
  max?: number;
}

/** "" → null, "12" → 12. */
export function parseNumeric(text: string): number | null {
  if (text.trim() === "") {
    return null;
  }

  const value = Number(text);

  return Number.isFinite(value) ? value : null;
}

export function clampNumeric(value: number, bounds: NumericBounds): number {
  const min = bounds.min ?? 0;
  const max = bounds.max ?? Number.MAX_SAFE_INTEGER;

  return Math.min(Math.max(value, min), max);
}
