/**
 * Waar een tab moet beginnen als je ernaar wisselt. Zolang de kop (deels) in
 * beeld is, houdt de nieuwe tab dezelfde stand, zodat de tabs op hun plek
 * blijven. Is de kop al weggescrold, dan houdt de nieuwe tab zijn eigen
 * plek, maar minstens zo ver dat de tabs net onder de balk staan.
 */
export function tabSwitchOffset(args: {
  /** Scrollstand van de tab die je verlaat. */
  fromY: number;
  /** Eigen scrollstand van de nieuwe tab, als die er al eens was. */
  ownY: number | undefined;
  /** Scrollstand waarbij de tabs onder de navigatiebalk verdwijnen. */
  limit: number;
}): number {
  const { fromY, ownY, limit } = args;

  if (fromY < limit) {
    return Math.max(0, fromY);
  }

  return Math.max(ownY ?? limit, limit);
}
