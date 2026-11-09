export interface ParticipantInfo {
  name: string;
  /** Korte naam voor krappe regels, bijv. "Pogačar"; valt terug op de naam. */
  shortName: string;
  /** Korte code voor badges, bijv. "NED". */
  code: string;
}

export type ParticipantMap = Map<string, ParticipantInfo>;

interface ParticipantSource {
  _id: string;
  name: string;
  shortName?: string | null;
  code: string | null;
}

export const UNKNOWN_PARTICIPANT: ParticipantInfo = {
  name: "Onbekend",
  shortName: "Onbekend",
  code: "?",
};

export function buildParticipantMap(
  participants: ParticipantSource[],
): ParticipantMap {
  return new Map(
    participants.map((participant) => [
      participant._id,
      {
        name: participant.name,
        shortName: participant.shortName ?? participant.name,
        code: participant.code ?? participant.name.slice(0, 3).toUpperCase(),
      },
    ]),
  );
}

export function participantInfo(
  participants: ParticipantMap,
  id: string | null,
): ParticipantInfo | null {
  if (id === null) {
    return null;
  }

  return participants.get(id) ?? null;
}

export function participantName(
  participants: ParticipantMap,
  id: string,
): string {
  return participants.get(id)?.name ?? UNKNOWN_PARTICIPANT.name;
}
