import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { Chip } from "@/components/cards/chip";
import { Avatar } from "@/components/ui/avatar";
import { roleLabel } from "@/utils/poule-text";
import type { PouleMember } from "@/utils/poules";

interface Props {
  members: PouleMember[];
}

/** Leden met avatar; eigenaar en beheerders krijgen een label. */
export function MembersCard({ members }: Props) {
  return (
    <Card isFlush>
      {members.map((member, index) => {
        const role = roleLabel(member.role);

        return (
          <CardRow
            key={member.userId}
            leading={
              <Avatar name={member.name} imageUrl={member.imageUrl} size={34} />
            }
            title={member.isMe ? `${member.name} (jij)` : member.name}
            trailing={role ? <Chip text={role} /> : undefined}
            isLast={index === members.length - 1}
          />
        );
      })}
    </Card>
  );
}
