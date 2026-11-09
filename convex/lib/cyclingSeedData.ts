import type { StageProfile } from "../../modules/cycling/stage-profile";

/**
 * Testgegevens voor wielrennen: renners, koersen en de Tour de France 2027.
 * Data en starttijden zijn schattingen op basis van vorige jaren; pas ze aan
 * zodra de officiële kalender er is.
 */

export interface SeedRider {
  name: string;
  /** Landcode voor de badge, zoals bij voetbal. */
  nation: string;
}

const rider = (name: string, nation: string): SeedRider => ({ name, nation });

const POGACAR = rider("Tadej Pogačar", "SLO");
const VINGEGAARD = rider("Jonas Vingegaard", "DEN");
const EVENEPOEL = rider("Remco Evenepoel", "BEL");
const ROGLIC = rider("Primož Roglič", "SLO");
const LIPOWITZ = rider("Florian Lipowitz", "GER");
const ALMEIDA = rider("João Almeida", "POR");
const DEL_TORO = rider("Isaac del Toro", "MEX");
const AYUSO = rider("Juan Ayuso", "ESP");
const VAUQUELIN = rider("Kévin Vauquelin", "FRA");
const ONLEY = rider("Oscar Onley", "GBR");
const GALL = rider("Felix Gall", "AUT");
const JORGENSON = rider("Matteo Jorgenson", "USA");
const ARENSMAN = rider("Thymen Arensman", "NED");
const MARTINEZ = rider("Lenny Martinez", "FRA");
const SEIXAS = rider("Paul Seixas", "FRA");
const WIDAR = rider("Jarno Widar", "BEL");
const RICCITELLO = rider("Matthew Riccitello", "USA");
const PIDCOCK = rider("Tom Pidcock", "GBR");
const HEALY = rider("Ben Healy", "IRL");
const SKJELMOSE = rider("Mattias Skjelmose", "DEN");
const POWLESS = rider("Neilson Powless", "USA");
const GREGOIRE = rider("Romain Grégoire", "FRA");
const ALAPHILIPPE = rider("Julian Alaphilippe", "FRA");
const SCHMID = rider("Mauro Schmid", "SUI");

const VAN_DER_POEL = rider("Mathieu van der Poel", "NED");
const VAN_AERT = rider("Wout van Aert", "BEL");
const PEDERSEN = rider("Mads Pedersen", "DEN");
const GANNA = rider("Filippo Ganna", "ITA");
const LAPORTE = rider("Christophe Laporte", "FRA");
const STUYVEN = rider("Jasper Stuyven", "BEL");
const WELLENS = rider("Tim Wellens", "BEL");
const VERMEERSCH = rider("Florian Vermeersch", "BEL");
const MOHORIC = rider("Matej Mohorič", "SLO");
const KUNG = rider("Stefan Küng", "SUI");
const BENOOT = rider("Tiesj Benoot", "BEL");
const T_VAN_DIJKE = rider("Tim van Dijke", "NED");
const VAN_BAARLE = rider("Dylan van Baarle", "NED");
const TEUNISSEN = rider("Mike Teunissen", "NED");
const MAGNIER = rider("Paul Magnier", "FRA");

const PHILIPSEN = rider("Jasper Philipsen", "BEL");
const MILAN = rider("Jonathan Milan", "ITA");
const MERLIER = rider("Tim Merlier", "BEL");
const KOOIJ = rider("Olav Kooij", "NED");
const GIRMAY = rider("Biniam Girmay", "ERI");
const GROENEWEGEN = rider("Dylan Groenewegen", "NED");
const DE_LIE = rider("Arnaud De Lie", "BEL");
const GROVES = rider("Kaden Groves", "AUS");
const VAN_UDEN = rider("Casper van Uden", "NED");

const COBBLES: SeedRider[] = [
  VAN_DER_POEL, POGACAR, PEDERSEN, VAN_AERT, PHILIPSEN, GANNA, LAPORTE,
  STUYVEN, WELLENS, VERMEERSCH, MOHORIC, KUNG, BENOOT, PIDCOCK, MILAN,
  MERLIER, DE_LIE, T_VAN_DIJKE, VAN_BAARLE, TEUNISSEN, KOOIJ, MAGNIER,
  GIRMAY, POWLESS,
];

const SANREMO: SeedRider[] = [
  VAN_DER_POEL, POGACAR, PHILIPSEN, PEDERSEN, GANNA, VAN_AERT, MILAN,
  MERLIER, KOOIJ, GIRMAY, DE_LIE, GROVES, MOHORIC, PIDCOCK, MAGNIER,
  LAPORTE, STUYVEN, SKJELMOSE, EVENEPOEL, ALAPHILIPPE, GROENEWEGEN,
  T_VAN_DIJKE,
];

const HILLS: SeedRider[] = [
  POGACAR, EVENEPOEL, VAN_DER_POEL, PIDCOCK, SKJELMOSE, HEALY, DEL_TORO,
  VAUQUELIN, POWLESS, GREGOIRE, ALAPHILIPPE, SCHMID, VAN_AERT, AYUSO,
  ALMEIDA, ONLEY, WIDAR, MOHORIC, WELLENS, BENOOT, ARENSMAN, T_VAN_DIJKE,
];

const CLIMBERS: SeedRider[] = [
  POGACAR, EVENEPOEL, VINGEGAARD, ROGLIC, DEL_TORO, AYUSO, ALMEIDA,
  LIPOWITZ, VAUQUELIN, ONLEY, GALL, JORGENSON, ARENSMAN, MARTINEZ, SEIXAS,
  WIDAR, RICCITELLO, PIDCOCK, HEALY, SKJELMOSE, GREGOIRE, POWLESS,
];

export const TOUR_RIDERS: SeedRider[] = [
  POGACAR, VINGEGAARD, EVENEPOEL, ROGLIC, LIPOWITZ, ALMEIDA, DEL_TORO,
  AYUSO, VAUQUELIN, ONLEY, GALL, JORGENSON, ARENSMAN, MARTINEZ, SEIXAS,
  HEALY, PIDCOCK, SKJELMOSE, VAN_DER_POEL, VAN_AERT, PEDERSEN, GANNA,
  PHILIPSEN, MILAN, MERLIER, KOOIJ, GIRMAY, GROENEWEGEN, DE_LIE, GROVES,
  VAN_UDEN, ALAPHILIPPE, WIDAR, RICCITELLO,
];

/** Wie meedoet aan een klassement; bepaalt de opties per vraag. */
export const TOUR_CLASSIFICATIONS = {
  gc: [
    POGACAR, VINGEGAARD, EVENEPOEL, ROGLIC, LIPOWITZ, ALMEIDA, DEL_TORO,
    AYUSO, VAUQUELIN, ONLEY, GALL, JORGENSON, ARENSMAN, MARTINEZ, SEIXAS,
  ],
  points: [
    PHILIPSEN, MILAN, MERLIER, KOOIJ, GIRMAY, GROENEWEGEN, DE_LIE, GROVES,
    VAN_UDEN, VAN_DER_POEL, VAN_AERT, PEDERSEN, POGACAR,
  ],
  mountains: [
    POGACAR, VINGEGAARD, HEALY, MARTINEZ, GALL, JORGENSON, ONLEY,
    ALAPHILIPPE, SKJELMOSE, ARENSMAN, DEL_TORO, EVENEPOEL,
  ],
  youth: [DEL_TORO, SEIXAS, MARTINEZ, WIDAR, RICCITELLO, ONLEY],
};

export const TOUR_TEAMS = [
  "UAE Team Emirates XRG",
  "Team Visma | Lease a Bike",
  "Red Bull-BORA-hansgrohe",
  "Alpecin-Premier Tech",
  "Lidl-Trek",
  "Soudal Quick-Step",
  "Decathlon CMA CGM",
  "INEOS Grenadiers",
  "EF Education-EasyPost",
];

export interface SeedClassic {
  key: string;
  name: string;
  shortName: string;
  /** Start in lokale tijd met tijdzone, bijv. "2027-04-04T10:00:00+02:00". */
  startsAt: string;
  route: string;
  distanceKm: number;
  profile: StageProfile;
  series: string[];
  riders: SeedRider[];
}

export const CLASSICS_2027: SeedClassic[] = [
  {
    key: "omloop",
    name: "Omloop Nieuwsblad 2027",
    shortName: "Omloop",
    startsAt: "2027-02-27T11:00:00+01:00",
    route: "Gent – Ninove",
    distanceKm: 197,
    profile: "cobbles",
    series: ["springClassics", "cobbledClassics"],
    riders: COBBLES,
  },
  {
    key: "strade-bianche",
    name: "Strade Bianche 2027",
    shortName: "Strade",
    startsAt: "2027-03-06T11:00:00+01:00",
    route: "Siena – Siena",
    distanceKm: 213,
    profile: "hilly",
    series: ["springClassics"],
    riders: HILLS,
  },
  {
    key: "milano-sanremo",
    name: "Milaan-Sanremo 2027",
    shortName: "Sanremo",
    startsAt: "2027-03-20T10:00:00+01:00",
    route: "Pavia – Sanremo",
    distanceKm: 289,
    profile: "hilly",
    series: ["springClassics", "monuments"],
    riders: SANREMO,
  },
  {
    key: "e3",
    name: "E3 Saxo Classic 2027",
    shortName: "E3",
    startsAt: "2027-03-26T12:30:00+01:00",
    route: "Harelbeke – Harelbeke",
    distanceKm: 208,
    profile: "cobbles",
    series: ["springClassics", "cobbledClassics"],
    riders: COBBLES,
  },
  {
    key: "gent-wevelgem",
    name: "Gent-Wevelgem 2027",
    shortName: "Gent-Wevelgem",
    startsAt: "2027-03-28T10:45:00+02:00",
    route: "Ieper – Wevelgem",
    distanceKm: 250,
    profile: "cobbles",
    series: ["springClassics", "cobbledClassics"],
    riders: COBBLES,
  },
  {
    key: "dwars-door-vlaanderen",
    name: "Dwars door Vlaanderen 2027",
    shortName: "Dwars door Vlaanderen",
    startsAt: "2027-03-31T12:00:00+02:00",
    route: "Roeselare – Waregem",
    distanceKm: 185,
    profile: "cobbles",
    series: ["springClassics", "cobbledClassics"],
    riders: COBBLES,
  },
  {
    key: "ronde-van-vlaanderen",
    name: "Ronde van Vlaanderen 2027",
    shortName: "Ronde",
    startsAt: "2027-04-04T10:00:00+02:00",
    route: "Brugge – Oudenaarde",
    distanceKm: 270,
    profile: "cobbles",
    series: ["springClassics", "monuments", "cobbledClassics"],
    riders: COBBLES,
  },
  {
    key: "parijs-roubaix",
    name: "Parijs-Roubaix 2027",
    shortName: "Roubaix",
    startsAt: "2027-04-11T11:00:00+02:00",
    route: "Compiègne – Roubaix",
    distanceKm: 259,
    profile: "cobbles",
    series: ["springClassics", "monuments", "cobbledClassics"],
    riders: COBBLES,
  },
  {
    key: "amstel-gold-race",
    name: "Amstel Gold Race 2027",
    shortName: "Amstel",
    startsAt: "2027-04-18T10:30:00+02:00",
    route: "Maastricht – Berg en Terblijt",
    distanceKm: 255,
    profile: "hilly",
    series: ["springClassics", "ardennesClassics"],
    riders: HILLS,
  },
  {
    key: "waalse-pijl",
    name: "Waalse Pijl 2027",
    shortName: "Waalse Pijl",
    startsAt: "2027-04-21T11:30:00+02:00",
    route: "Herve – Hoei",
    distanceKm: 205,
    profile: "summitFinish",
    series: ["springClassics", "ardennesClassics"],
    riders: HILLS,
  },
  {
    key: "luik-bastenaken-luik",
    name: "Luik-Bastenaken-Luik 2027",
    shortName: "Luik",
    startsAt: "2027-04-25T10:00:00+02:00",
    route: "Luik – Luik",
    distanceKm: 252,
    profile: "hilly",
    series: ["springClassics", "monuments", "ardennesClassics"],
    riders: HILLS,
  },
  {
    key: "ronde-van-lombardije",
    name: "Ronde van Lombardije 2027",
    shortName: "Lombardije",
    startsAt: "2027-10-09T10:00:00+02:00",
    route: "Como – Bergamo",
    distanceKm: 241,
    profile: "mountain",
    series: ["monuments"],
    riders: CLIMBERS,
  },
];

export interface SeedStage {
  /** Lokale starttijd met tijdzone. */
  startsAt: string;
  route?: string;
  distanceKm?: number;
  profile?: StageProfile;
}

/**
 * Tour de France 2027: Grand Départ in Edinburgh op 3 juli, rustdagen op
 * 12 en 19 juli, finish in Parijs op 25 juli. Het parcours is nog niet
 * bekend, dus alleen de data staan erin.
 */
export const TOUR_2027_STAGE_DATES = [
  "2027-07-03", "2027-07-04", "2027-07-05", "2027-07-06", "2027-07-07",
  "2027-07-08", "2027-07-09", "2027-07-10", "2027-07-11",
  "2027-07-13", "2027-07-14", "2027-07-15", "2027-07-16", "2027-07-17",
  "2027-07-18",
  "2027-07-20", "2027-07-21", "2027-07-22", "2027-07-23", "2027-07-24",
  "2027-07-25",
];

/** In welke week (fase) elke etappe valt: 1–9, 10–15, 16–21. */
export const TOUR_WEEK_STARTS = [1, 10, 16];

/** Een korte testronde met bestaande wegen, om alles te kunnen proberen. */
export const TEST_TOUR_STAGES: Omit<SeedStage, "startsAt">[] = [
  { route: "Utrecht – Utrecht", distanceKm: 14, profile: "timeTrial" },
  { route: "Rotterdam – Den Haag", distanceKm: 172, profile: "flat" },
  { route: "Maastricht – Valkenburg", distanceKm: 188, profile: "hilly" },
  { route: "Gérardmer – La Planche des Belles Filles", distanceKm: 196, profile: "summitFinish" },
  { route: "Arenberg – Roubaix", distanceKm: 158, profile: "cobbles" },
];
