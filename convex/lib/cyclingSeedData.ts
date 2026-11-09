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
  VAN_DER_POEL,
  POGACAR,
  PEDERSEN,
  VAN_AERT,
  PHILIPSEN,
  GANNA,
  LAPORTE,
  STUYVEN,
  WELLENS,
  VERMEERSCH,
  MOHORIC,
  KUNG,
  BENOOT,
  PIDCOCK,
  MILAN,
  MERLIER,
  DE_LIE,
  T_VAN_DIJKE,
  VAN_BAARLE,
  TEUNISSEN,
  KOOIJ,
  MAGNIER,
  GIRMAY,
  POWLESS,
];

const SANREMO: SeedRider[] = [
  VAN_DER_POEL,
  POGACAR,
  PHILIPSEN,
  PEDERSEN,
  GANNA,
  VAN_AERT,
  MILAN,
  MERLIER,
  KOOIJ,
  GIRMAY,
  DE_LIE,
  GROVES,
  MOHORIC,
  PIDCOCK,
  MAGNIER,
  LAPORTE,
  STUYVEN,
  SKJELMOSE,
  EVENEPOEL,
  ALAPHILIPPE,
  GROENEWEGEN,
  T_VAN_DIJKE,
];

const HILLS: SeedRider[] = [
  POGACAR,
  EVENEPOEL,
  VAN_DER_POEL,
  PIDCOCK,
  SKJELMOSE,
  HEALY,
  DEL_TORO,
  VAUQUELIN,
  POWLESS,
  GREGOIRE,
  ALAPHILIPPE,
  SCHMID,
  VAN_AERT,
  AYUSO,
  ALMEIDA,
  ONLEY,
  WIDAR,
  MOHORIC,
  WELLENS,
  BENOOT,
  ARENSMAN,
  T_VAN_DIJKE,
];

const CLIMBERS: SeedRider[] = [
  POGACAR,
  EVENEPOEL,
  VINGEGAARD,
  ROGLIC,
  DEL_TORO,
  AYUSO,
  ALMEIDA,
  LIPOWITZ,
  VAUQUELIN,
  ONLEY,
  GALL,
  JORGENSON,
  ARENSMAN,
  MARTINEZ,
  SEIXAS,
  WIDAR,
  RICCITELLO,
  PIDCOCK,
  HEALY,
  SKJELMOSE,
  GREGOIRE,
  POWLESS,
];

export const TOUR_RIDERS: SeedRider[] = [
  POGACAR,
  VINGEGAARD,
  EVENEPOEL,
  ROGLIC,
  LIPOWITZ,
  ALMEIDA,
  DEL_TORO,
  AYUSO,
  VAUQUELIN,
  ONLEY,
  GALL,
  JORGENSON,
  ARENSMAN,
  MARTINEZ,
  SEIXAS,
  HEALY,
  PIDCOCK,
  SKJELMOSE,
  VAN_DER_POEL,
  VAN_AERT,
  PEDERSEN,
  GANNA,
  PHILIPSEN,
  MILAN,
  MERLIER,
  KOOIJ,
  GIRMAY,
  GROENEWEGEN,
  DE_LIE,
  GROVES,
  VAN_UDEN,
  ALAPHILIPPE,
  WIDAR,
  RICCITELLO,
];

/** Wie meedoet aan een klassement; bepaalt de opties per vraag. */
export const TOUR_CLASSIFICATIONS = {
  gc: [
    POGACAR,
    VINGEGAARD,
    EVENEPOEL,
    ROGLIC,
    LIPOWITZ,
    ALMEIDA,
    DEL_TORO,
    AYUSO,
    VAUQUELIN,
    ONLEY,
    GALL,
    JORGENSON,
    ARENSMAN,
    MARTINEZ,
    SEIXAS,
  ],
  points: [
    PHILIPSEN,
    MILAN,
    MERLIER,
    KOOIJ,
    GIRMAY,
    GROENEWEGEN,
    DE_LIE,
    GROVES,
    VAN_UDEN,
    VAN_DER_POEL,
    VAN_AERT,
    PEDERSEN,
    POGACAR,
  ],
  mountains: [
    POGACAR,
    VINGEGAARD,
    HEALY,
    MARTINEZ,
    GALL,
    JORGENSON,
    ONLEY,
    ALAPHILIPPE,
    SKJELMOSE,
    ARENSMAN,
    DEL_TORO,
    EVENEPOEL,
  ],
  youth: [DEL_TORO, SEIXAS, MARTINEZ, WIDAR, RICCITELLO, ONLEY],
};

export interface SeedTeam {
  name: string;
  /** Kort voor krappe plekken, bijv. "Visma". */
  shortName: string;
  /** UCI-teamcode, voor de badge. */
  code: string;
  /** Engelstalig Wikipedia-artikel, om het logo op te zoeken. */
  wiki: string;
}

const team = (
  name: string,
  shortName: string,
  code: string,
  wiki: string,
): SeedTeam => ({ name, shortName, code, wiki });

/**
 * Ploegen in een grote ronde: de 18 WorldTeams van 2026 en de ProTeams die
 * vaak een wildcard krijgen. Zo is "Andere ploeg" niet nodig. Pas de lijst
 * aan zodra de startlijst van 2027 bekend is.
 */
export const GRAND_TOUR_TEAMS: SeedTeam[] = [
  team("UAE Team Emirates XRG", "UAE", "UAD", "UAE Team Emirates XRG"),
  team("Team Visma | Lease a Bike", "Visma", "TVL", "Team Visma–Lease a Bike"),
  team("Red Bull-BORA-hansgrohe", "Red Bull", "RBH", "Red Bull–Bora–Hansgrohe"),
  team("Lidl-Trek", "Lidl-Trek", "LTK", "Lidl–Trek"),
  team("Soudal Quick-Step", "Soudal", "SOQ", "Soudal–Quick-Step"),
  team("Alpecin-Premier Tech", "Alpecin", "APT", "Alpecin–Deceuninck"),
  team("INEOS Grenadiers", "INEOS", "IGD", "Ineos Grenadiers"),
  team("Decathlon CMA CGM", "Decathlon", "DCT", "Decathlon AG2R La Mondiale"),
  team("EF Education-EasyPost", "EF", "EFE", "EF Education–EasyPost"),
  team("Movistar Team", "Movistar", "MOV", "Movistar Team"),
  team("Groupama-FDJ", "FDJ", "GFC", "Groupama–FDJ"),
  team("Bahrain Victorious", "Bahrain", "TBV", "Team Bahrain Victorious"),
  team("Team Jayco AlUla", "Jayco", "JAY", "Team Jayco–AlUla"),
  team("XDS Astana Team", "Astana", "XAT", "Astana Qazaqstan Team"),
  team("Team Picnic PostNL", "Picnic", "TPP", "Team Picnic–PostNL"),
  team("Lotto Intermarché", "Lotto", "LOI", "Lotto–Dstny"),
  team("Uno-X Mobility", "Uno-X", "UXM", "Uno-X Mobility"),
  team("NSN Cycling Team", "NSN", "NSN", "Israel–Premier Tech"),
  team("Tudor Pro Cycling", "Tudor", "TUD", "Tudor Pro Cycling Team"),
  team("TotalEnergies", "TotalEnergies", "TEN", "Team TotalEnergies"),
  team("Cofidis", "Cofidis", "COF", "Cofidis (cycling team)"),
  team("Q36.5 Pro Cycling", "Q36.5", "Q36", "Q36.5 Pro Cycling Team"),
];

/** De namen van vóór de ploegen deelnemers werden, voor het omzetten. */
export const LEGACY_TOUR_TEAMS = [
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
  "2027-07-03",
  "2027-07-04",
  "2027-07-05",
  "2027-07-06",
  "2027-07-07",
  "2027-07-08",
  "2027-07-09",
  "2027-07-10",
  "2027-07-11",
  "2027-07-13",
  "2027-07-14",
  "2027-07-15",
  "2027-07-16",
  "2027-07-17",
  "2027-07-18",
  "2027-07-20",
  "2027-07-21",
  "2027-07-22",
  "2027-07-23",
  "2027-07-24",
  "2027-07-25",
];

/** In welke week (fase) elke etappe valt: 1–9, 10–15, 16–21. */
export const TOUR_WEEK_STARTS = [1, 10, 16];

/**
 * Giro d'Italia 2027: schatting op basis van voorgaande jaren. Start op
 * zaterdag 8 mei, rustdagen na etappe 9 en 15, finish op zondag 30 mei. Pas
 * aan zodra de officiële kalender er is.
 */
export const GIRO_2027_STAGE_DATES = [
  "2027-05-08",
  "2027-05-09",
  "2027-05-10",
  "2027-05-11",
  "2027-05-12",
  "2027-05-13",
  "2027-05-14",
  "2027-05-15",
  "2027-05-16",
  "2027-05-18",
  "2027-05-19",
  "2027-05-20",
  "2027-05-21",
  "2027-05-22",
  "2027-05-23",
  "2027-05-25",
  "2027-05-26",
  "2027-05-27",
  "2027-05-28",
  "2027-05-29",
  "2027-05-30",
];

/** In welke week (fase) elke Giro-etappe valt: 1–9, 10–15, 16–21. */
export const GIRO_WEEK_STARTS = [1, 10, 16];

/**
 * Vuelta a España 2027: schatting op basis van voorgaande jaren. Start op
 * zaterdag 21 augustus, rustdagen na etappe 9 en 15, finish op zondag 12
 * september. Pas aan zodra de officiële kalender er is.
 */
export const VUELTA_2027_STAGE_DATES = [
  "2027-08-21",
  "2027-08-22",
  "2027-08-23",
  "2027-08-24",
  "2027-08-25",
  "2027-08-26",
  "2027-08-27",
  "2027-08-28",
  "2027-08-29",
  "2027-08-31",
  "2027-09-01",
  "2027-09-02",
  "2027-09-03",
  "2027-09-04",
  "2027-09-05",
  "2027-09-07",
  "2027-09-08",
  "2027-09-09",
  "2027-09-10",
  "2027-09-11",
  "2027-09-12",
];

/** In welke week (fase) elke Vuelta-etappe valt: 1–9, 10–15, 16–21. */
export const VUELTA_WEEK_STARTS = [1, 10, 16];

/** Een korte testronde met bestaande wegen, om alles te kunnen proberen. */
export const TEST_TOUR_STAGES: Omit<SeedStage, "startsAt">[] = [
  { route: "Utrecht – Utrecht", distanceKm: 14, profile: "timeTrial" },
  { route: "Rotterdam – Den Haag", distanceKm: 172, profile: "flat" },
  { route: "Maastricht – Valkenburg", distanceKm: 188, profile: "hilly" },
  {
    route: "Gérardmer – La Planche des Belles Filles",
    distanceKm: 196,
    profile: "summitFinish",
  },
  { route: "Arenberg – Roubaix", distanceKm: 158, profile: "cobbles" },
];

/** Meer renners, zodat zoeken in alle atleten zin heeft. */
const MORE_RIDERS: SeedRider[] = [
  rider("Wout Poels", "NED"),
  rider("Pascal Eenkhoorn", "NED"),
  rider("Cees Bol", "NED"),
  rider("Fabio Jakobsen", "NED"),
  rider("Danny van Poppel", "NED"),
  rider("Marijn van den Berg", "NED"),
  rider("Frank van den Broek", "NED"),
  rider("Gijs Leemreize", "NED"),
  rider("Wilco Kelderman", "NED"),
  rider("Sam Oomen", "NED"),
  rider("Mick van Dijke", "NED"),
  rider("Lennert Van Eetvelt", "BEL"),
  rider("Maxim Van Gils", "BEL"),
  rider("Ilan Van Wilder", "BEL"),
  rider("Cian Uijtdebroeks", "BEL"),
  rider("Jordi Meeus", "BEL"),
  rider("Gerben Thijssen", "BEL"),
  rider("Victor Campenaerts", "BEL"),
  rider("Yves Lampaert", "BEL"),
  rider("Quinten Hermans", "BEL"),
  rider("Oliver Naesen", "BEL"),
  rider("Laurenz Rex", "BEL"),
  rider("David Gaudu", "FRA"),
  rider("Valentin Madouas", "FRA"),
  rider("Benoît Cosnefroy", "FRA"),
  rider("Arnaud Démare", "FRA"),
  rider("Guillaume Martin", "FRA"),
  rider("Axel Laurance", "FRA"),
  rider("Giulio Ciccone", "ITA"),
  rider("Antonio Tiberi", "ITA"),
  rider("Alberto Bettiol", "ITA"),
  rider("Giulio Pellizzari", "ITA"),
  rider("Filippo Zana", "ITA"),
  rider("Lorenzo Fortunato", "ITA"),
  rider("Enric Mas", "ESP"),
  rider("Mikel Landa", "ESP"),
  rider("Pello Bilbao", "ESP"),
  rider("Carlos Rodríguez", "ESP"),
  rider("Marc Soler", "ESP"),
  rider("Iván Romeo", "ESP"),
  rider("Alex Aranburu", "ESP"),
  rider("Adam Yates", "GBR"),
  rider("Simon Yates", "GBR"),
  rider("Fred Wright", "GBR"),
  rider("Ethan Hayter", "GBR"),
  rider("Josh Tarling", "GBR"),
  rider("Lennard Kämna", "GER"),
  rider("Nils Politt", "GER"),
  rider("Pascal Ackermann", "GER"),
  rider("Phil Bauhaus", "GER"),
  rider("Georg Zimmermann", "GER"),
  rider("Magnus Cort", "DEN"),
  rider("Kasper Asgreen", "DEN"),
  rider("Michael Valgren", "DEN"),
  rider("Tobias Lund Andresen", "DEN"),
  rider("Tobias Halland Johannessen", "NOR"),
  rider("Alexander Kristoff", "NOR"),
  rider("Søren Wærenskjold", "NOR"),
  rider("Jonas Abrahamsen", "NOR"),
  rider("Marc Hirschi", "SUI"),
  rider("Stefan Bissegger", "SUI"),
  rider("Michael Matthews", "AUS"),
  rider("Jai Hindley", "AUS"),
  rider("Ben O'Connor", "AUS"),
  rider("Caleb Ewan", "AUS"),
  rider("Luke Plapp", "AUS"),
  rider("Sepp Kuss", "USA"),
  rider("Brandon McNulty", "USA"),
  rider("Quinn Simmons", "USA"),
  rider("Egan Bernal", "COL"),
  rider("Santiago Buitrago", "COL"),
  rider("Daniel Martínez", "COL"),
  rider("Richard Carapaz", "ECU"),
  rider("Jhonatan Narváez", "ECU"),
  rider("Jan Tratnik", "SLO"),
  rider("Derek Gee", "CAN"),
  rider("Michael Woods", "CAN"),
  rider("Eddie Dunbar", "IRL"),
  rider("Sam Bennett", "IRL"),
  rider("Michał Kwiatkowski", "POL"),
  rider("Rui Costa", "POR"),
  rider("Alexey Lutsenko", "KAZ"),
  rider("Finn Fisher-Black", "NZL"),
];

/** Alle renners voor de atletentabel, zonder dubbelen. */
export const ALL_RIDERS: SeedRider[] = [
  ...new Map(
    [
      ...TOUR_RIDERS,
      ...COBBLES,
      ...SANREMO,
      ...HILLS,
      ...CLIMBERS,
      ...MORE_RIDERS,
    ].map((seedRider) => [seedRider.name, seedRider]),
  ).values(),
];
