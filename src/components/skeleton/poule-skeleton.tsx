import { SectionTitle } from "@/components/cards/section-title";

import { Skeleton } from "./skeleton";
import { SkeletonCardList } from "./skeleton-card-list";
import { SkeletonHeroCard } from "./skeleton-hero-card";

/** Poulescherm tijdens het laden: kop, stand, programma en leden. */
export function PouleSkeleton() {
  return (
    <Skeleton>
      <SkeletonHeroCard />
      <SectionTitle>Stand</SectionTitle>
      <SkeletonCardList rows={3} hasTrailing />
      <SectionTitle>Programma</SectionTitle>
      <SkeletonCardList rows={2} leading="square" />
      <SectionTitle>Leden</SectionTitle>
      <SkeletonCardList rows={2} />
    </Skeleton>
  );
}
