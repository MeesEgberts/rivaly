import { v, type Infer } from "convex/values";

/** Het soort parcours van een etappe of eendagskoers. */
export const stageProfileValidator = v.union(
  v.literal("flat"),
  v.literal("hilly"),
  v.literal("mountain"),
  v.literal("summitFinish"),
  v.literal("timeTrial"),
  v.literal("teamTimeTrial"),
  v.literal("cobbles"),
);

export type StageProfile = Infer<typeof stageProfileValidator>;

export interface StageProfileInfo {
  label: string;
  /** Wie hier kans maakt, zodat je weet wie je moet kiezen. */
  favours: string;
  /**
   * Gestileerd hoogteprofiel van start tot finish, waarden 0–1. Geen echte
   * hoogtemeters, maar genoeg om het soort rit in één oogopslag te zien.
   */
  elevation: number[];
}

export const STAGE_PROFILES: Record<StageProfile, StageProfileInfo> = {
  flat: {
    label: "Vlak",
    favours: "Kans voor de sprinters",
    elevation: [
      0.12, 0.14, 0.13, 0.16, 0.15, 0.18, 0.16, 0.14, 0.17, 0.2, 0.18, 0.15,
      0.17, 0.19, 0.16, 0.14, 0.15, 0.17, 0.16, 0.14, 0.13, 0.15, 0.14, 0.12,
    ],
  },
  hilly: {
    label: "Heuvelachtig",
    favours: "Kans voor aanvallers en puncheurs",
    elevation: [
      0.15, 0.22, 0.35, 0.28, 0.2, 0.32, 0.45, 0.34, 0.25, 0.38, 0.5, 0.36,
      0.27, 0.42, 0.55, 0.4, 0.3, 0.44, 0.58, 0.42, 0.33, 0.48, 0.6, 0.52,
    ],
  },
  mountain: {
    label: "Bergen",
    favours: "Kans voor klimmers en klassementsrenners",
    elevation: [
      0.12, 0.25, 0.45, 0.7, 0.85, 0.6, 0.35, 0.22, 0.4, 0.62, 0.82, 0.95, 0.7,
      0.42, 0.25, 0.35, 0.55, 0.75, 0.88, 0.68, 0.45, 0.3, 0.25, 0.2,
    ],
  },
  summitFinish: {
    label: "Aankomst bergop",
    favours: "Kans voor klimmers; hier valt het klassement",
    elevation: [
      0.12, 0.14, 0.18, 0.15, 0.2, 0.28, 0.22, 0.18, 0.25, 0.35, 0.3, 0.26,
      0.32, 0.42, 0.5, 0.45, 0.52, 0.6, 0.68, 0.75, 0.82, 0.88, 0.94, 1,
    ],
  },
  timeTrial: {
    label: "Tijdrit",
    favours: "Kans voor tijdrijders, alleen tegen de klok",
    elevation: [
      0.18, 0.2, 0.19, 0.22, 0.21, 0.24, 0.22, 0.2, 0.23, 0.25, 0.23, 0.21,
      0.22, 0.24, 0.22, 0.2, 0.21, 0.23, 0.22, 0.2, 0.21, 0.22, 0.2, 0.19,
    ],
  },
  teamTimeTrial: {
    label: "Ploegentijdrit",
    favours: "De sterkste ploeg wint; kies een kopman uit die ploeg",
    elevation: [
      0.18, 0.2, 0.19, 0.22, 0.21, 0.24, 0.22, 0.2, 0.23, 0.25, 0.23, 0.21,
      0.22, 0.24, 0.22, 0.2, 0.21, 0.23, 0.22, 0.2, 0.21, 0.22, 0.2, 0.19,
    ],
  },
  cobbles: {
    label: "Kasseien",
    favours: "Kans voor klassiekerspecialisten; pech ligt op de loer",
    elevation: [
      0.2, 0.26, 0.18, 0.3, 0.22, 0.28, 0.2, 0.34, 0.24, 0.3, 0.2, 0.36, 0.26,
      0.32, 0.22, 0.38, 0.28, 0.34, 0.24, 0.4, 0.3, 0.36, 0.26, 0.3,
    ],
  },
};

/** Truien en klassementen van een grote ronde. */
export const jerseyValidator = v.union(
  v.literal("yellow"),
  v.literal("green"),
  v.literal("polka"),
  v.literal("white"),
  v.literal("pink"),
  v.literal("purple"),
  v.literal("blue"),
  v.literal("red"),
  v.literal("polkaBlue"),
);

export type Jersey = Infer<typeof jerseyValidator>;

export const JERSEYS: Record<Jersey, { name: string; classification: string }> =
  {
    yellow: { name: "Gele trui", classification: "Klassement" },
    green: { name: "Groene trui", classification: "Puntenklassement" },
    polka: { name: "Bolletjestrui", classification: "Bergklassement" },
    white: { name: "Witte trui", classification: "Jongerenklassement" },
    pink: { name: "Roze trui", classification: "Klassement" },
    purple: { name: "Paarse trui", classification: "Puntenklassement" },
    blue: { name: "Blauwe trui", classification: "Bergklassement" },
    red: { name: "Rode trui", classification: "Klassement" },
    polkaBlue: { name: "Bolletjestrui", classification: "Bergklassement" },
  };
