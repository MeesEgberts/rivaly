import { Card } from "@/components/cards/card";

import { SkeletonRow } from "./skeleton-row";

interface Props {
  rows: number;
  leading?: "circle" | "square" | "none";
  hasTrailing?: boolean;
}

const WIDTHS = ["58%", "44%", "66%", "50%", "38%", "62%"] as const;

/** Een kaart vol rijen, zoals de stand, het programma of de leden. */
export function SkeletonCardList({ rows, leading, hasTrailing }: Props) {
  return (
    <Card isFlush>
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonRow
          key={index}
          leading={leading}
          titleWidth={WIDTHS[index % WIDTHS.length]}
          hasTrailing={hasTrailing}
          isLast={index === rows - 1}
        />
      ))}
    </Card>
  );
}
