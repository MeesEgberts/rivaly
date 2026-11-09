import { router } from "expo-router";

/**
 * Sluit de hele "Wedstrijd toevoegen"-modal vanuit een genest scherm. Een
 * gewone `dismiss` sluit binnen de modal-stack alleen het bovenste scherm;
 * eerst terug naar het eerste scherm en dan `back` laat de modal zelf dicht
 * gaan. De nieuwe wedstrijd staat daarna direct in het programma.
 */
export function closeAddEventModal() {
  router.dismissAll();
  router.back();
}
