/** Kleine letters zonder accenten, zodat "pogacar" ook "Pogačar" vindt. */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("nl")
    .trim();
}

export function matchesSearch(texts: string[], term: string): boolean {
  const needle = normalizeSearch(term);

  if (needle.length === 0) {
    return true;
  }

  return texts.some((text) => normalizeSearch(text).includes(needle));
}

/** Vanaf hoeveel opties een zoekveld zinvol is. */
export const SEARCH_THRESHOLD = 12;
