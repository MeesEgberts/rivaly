import { formatDateTime } from "@/utils/format";

interface EventProgress {
  open: number;
  predicted: number;
  nextLockAt: number | null;
}

export function eventProgressSubtitle(event: EventProgress): string {
  if (event.open === 0) {
    return "Niets meer open";
  }

  const remaining = event.open - event.predicted;

  if (remaining === 0 || event.nextLockAt === null) {
    return "Alles ingevuld, aanpassen kan nog";
  }

  return `${remaining} nog in te vullen · eerste sluit ${formatDateTime(event.nextLockAt)}`;
}
