import { router } from "expo-router";

import type { Id } from "@convex/_generated/dataModel";
import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { Chip } from "@/components/cards/chip";
import { Avatar } from "@/components/ui/avatar";
import { roleLabel } from "@/utils/poule-text";
import { firstName, type PouleMember } from "@/utils/poules";

interface Props {
  pouleId: Id<"poules">;
  members: PouleMember[];
}

/** Leden met avatar; eigenaar en beheerders krijgen een label. Tik voor hun voorspellingen. */
export function MembersCard({ pouleId, members }: Props) {
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
            onPress={() =>
              router.push({
                pathname: "/poules/[pouleId]/member/[userId]",
                params: {
                  pouleId,
                  userId: member.userId,
                  title: firstName(member.name),
                },
              })
            }
            isLast={index === members.length - 1}
          />
        );
      })}
    </Card>
  );
}
