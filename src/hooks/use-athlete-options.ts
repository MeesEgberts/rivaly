import { useQuery } from "convex/react";
import { useMemo } from "react";

import { api } from "@convex/_generated/api";
import type { AthleteInfo } from "@/types/athlete";

interface Args {
  pool: { sport: string; nation?: string };
  /** De favorieten van de vraag, al omgezet naar atleten. */
  favourites: AthleteInfo[];
  search: string;
  /** Al gekozen; die staan op het podium en niet nog eens in de lijst. */
  chosen: (string | null)[];
}

/**
 * De atleten in de lijst onder het podium: zonder zoekterm de favorieten,
 * met zoekterm alle atleten van de sport uit de database.
 */
export function useAthleteOptions({ pool, favourites, search, chosen }: Args) {
  const term = search.trim();
  const results = useQuery(
    api.athletes.search,
    term.length > 0
      ? { sport: pool.sport, nation: pool.nation, query: term }
      : "skip",
  );

  const athletes = useMemo<AthleteInfo[]>(() => {
    const source =
      term.length === 0
        ? favourites
        : (results ?? []).map((athlete) => ({
            id: athlete._id,
            name: athlete.name,
            shortName: athlete.shortName,
            code: athlete.nation,
            imageUrl: athlete.imageUrl,
          }));

    return source.filter((athlete) => !chosen.includes(athlete.id));
  }, [term, favourites, results, chosen]);

  return {
    athletes,
    isSearching: term.length > 0,
    isLoading: term.length > 0 && results === undefined,
  };
}
