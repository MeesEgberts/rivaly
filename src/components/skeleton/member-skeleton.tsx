import { SectionTitle } from "@/components/cards/section-title";

import { Skeleton } from "./skeleton";
import { SkeletonCardList } from "./skeleton-card-list";
import { SkeletonHeroCard } from "./skeleton-hero-card";

/** Voorspellingen van een lid tijdens het laden: kop en een evenementkaart. */
export function MemberSkeleton() {
  return (
    <Skeleton>
      <SkeletonHeroCard />
      <SectionTitle>Voorspellingen</SectionTitle>
      <SkeletonCardList rows={5} leading="none" hasTrailing />
    </Skeleton>
  );
}
