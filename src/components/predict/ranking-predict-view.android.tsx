import { GenericPredictForm } from "./generic-predict-form";
import type { RankingPredictViewProps } from "./ranking-predict-view";

/** Android: voorlopig het generieke formulier (teams in volgorde aantikken). */
export function RankingPredictView({ fixture }: RankingPredictViewProps) {
  return <GenericPredictForm fixture={fixture} />;
}
