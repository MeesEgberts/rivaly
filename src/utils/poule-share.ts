import { Share } from "react-native";

/** Opent het deelmenu met een uitnodiging voor de poule. */
export function sharePouleInvite(pouleName: string, inviteCode: string) {
  Share.share({
    message: `Doe mee met mijn poule "${pouleName}" in Rivaly. Code: ${inviteCode}`,
  });
}
