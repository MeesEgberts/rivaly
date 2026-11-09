/** Leest een verplichte `EXPO_PUBLIC_*`-variabele en legt uit waar hij vandaan moet komen. */
export function requireEnv(
  value: string | undefined,
  name: string,
  hint: string,
): string {
  if (!value) {
    throw new Error(`${name} ontbreekt. ${hint}`);
  }

  return value;
}
