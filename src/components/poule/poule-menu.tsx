import { router, Stack } from "expo-router";

import type { Id } from "@convex/_generated/dataModel";
import { useDeletePoule } from "@/hooks/use-delete-poule";
import { sharePouleInvite } from "@/utils/poule-share";

interface Props {
  pouleId: Id<"poules">;
  pouleName: string;
  inviteCode: string;
  canEdit: boolean;
  /** Alleen de eigenaar, en alleen zolang niemand anders meedoet. */
  canDelete: boolean;
}

/** Menu rechtsboven op het poulescherm: delen, bewerken en verwijderen. */
export function PouleMenu({
  pouleId,
  pouleName,
  inviteCode,
  canEdit,
  canDelete,
}: Props) {
  const confirmDelete = useDeletePoule(pouleId, pouleName);

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Poule-opties">
        <Stack.Toolbar.MenuAction
          icon="square.and.arrow.up"
          onPress={() => sharePouleInvite(pouleName, inviteCode)}
        >
          Deel uitnodiging
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="pencil"
          hidden={!canEdit}
          onPress={() =>
            router.push({
              pathname: "/poules/[pouleId]/edit",
              params: { pouleId },
            })
          }
        >
          Bewerk poule
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="trash"
          destructive
          hidden={!canDelete}
          onPress={confirmDelete}
        >
          Verwijder poule
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
