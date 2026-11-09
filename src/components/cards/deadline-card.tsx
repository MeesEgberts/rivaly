import { formatMoment, formatTimeLeft } from "@/utils/prediction-cards";

import { ProgressCard } from "./progress-card";

interface Props {
  locksAt: number;
  now: number;
  answered: number;
  total: number;
}

/** "Vóór de start invullen" met aftellen en hoeveel je al hebt ingevuld. */
export function DeadlineCard({ locksAt, now, answered, total }: Props) {
  const isOpen = now < locksAt;

  return (
    <ProgressCard
      icon={isOpen ? "clock.fill" : "lock.fill"}
      isMuted={!isOpen}
      title={isOpen ? "Vóór de start invullen" : "Gesloten bij de start"}
      subtitle={
        isOpen
          ? `${formatMoment(locksAt)} · ${formatTimeLeft(locksAt, now)}`
          : formatMoment(locksAt)
      }
      answered={answered}
      total={total}
    />
  );
}
