import { PodiumCard } from "@/components/cycling/podium-card";
import { initials } from "@/utils/avatar";
import { firstName, type StandingRow } from "@/utils/poules";

interface Props {
  rows: StandingRow[];
}

/** De top 3 van de poule als podium; pas vanaf drie deelnemers. */
export function StandingsPodium({ rows }: Props) {
  if (rows.length < 3) {
    return null;
  }

  const slots = rows.slice(0, 3).map((row, index) => ({
    position: index + 1,
    rider: {
      id: row.userId,
      name: firstName(row.name),
      code: initials(row.name),
      imageUrl: row.imageUrl,
    },
    hit: null,
  }));

  return <PodiumCard title="Top 3" slots={slots} />;
}
