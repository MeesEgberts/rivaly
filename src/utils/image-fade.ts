const shown = new Set<string>();

/**
 * Hoe lang een afbeelding infadet: alleen de eerste keer. Daarna komt hij
 * uit het geheugen en staat hij er meteen, zodat hij niet opnieuw knippert
 * als een scherm of tab hem nog eens toont.
 */
export function fadeInOnce(url: string, duration = 200): number {
  if (shown.has(url)) {
    return 0;
  }

  shown.add(url);
  return duration;
}
