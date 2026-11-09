/**
 * Zoektekst normaliseren: kleine letters zonder accenten, zodat "pogacar"
 * ook "Pogačar" vindt. Gedeeld door server (zoekindex) en app.
 */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("nl")
    .replace(/\s+/g, " ")
    .trim();
}
