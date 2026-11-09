import type { SkatingCategory } from "../../modules/skating/categories";
import { SHORTTRACK_FIELD, SPEEDSKATING_FIELD } from "./skatingFields2026";
import { SPEEDSKATING_ISU_FIELD } from "./skatingFieldIsu";

/**
 * Schaatsen en shorttrack, seizoen 2026/27: atleten per categorie en de
 * kalender van de ISU (World Cups, World Tour, EK's en WK's). Plaatsen en
 * data komen van de ISU-kalender; het programma per dag, de starttijden en
 * de favorieten zijn schattingen tot het officiële tijdschema er is.
 */

export interface SeedSkater {
  name: string;
  /** Landcode voor de vlag, bijv. "NED". */
  nation: string;
  category: SkatingCategory;
  /** Officiële portretfoto, bijv. van de ISU. */
  imageUrl?: string;
}

const men = (name: string, nation: string): SeedSkater => ({
  name,
  nation,
  category: "men",
});
const women = (name: string, nation: string): SeedSkater => ({
  name,
  nation,
  category: "women",
});

const SPEEDSKATING_FAVOURITES: SeedSkater[] = [
  men("Jordan Stolz", "USA"),
  men("Jenning de Boo", "NED"),
  men("Joep Wennemars", "NED"),
  men("Kjeld Nuis", "NED"),
  men("Patrick Roest", "NED"),
  men("Marcel Bosker", "NED"),
  men("Tim Prins", "NED"),
  men("Beau Snellink", "NED"),
  men("Chris Huizinga", "NED"),
  men("Stijn van de Bunt", "NED"),
  men("Jorrit Bergsma", "NED"),
  men("Kai Verbij", "NED"),
  men("Davide Ghiotto", "ITA"),
  men("Andrea Giovannini", "ITA"),
  men("Sander Eitrem", "NOR"),
  men("Peder Kongshaug", "NOR"),
  men("Vladimir Semirunniy", "POL"),
  men("Damian Żurek", "POL"),
  men("Ning Zhongyan", "CHN"),
  men("Laurent Dubreuil", "CAN"),
  men("Connor Howe", "CAN"),
  men("Ted-Jan Bloemen", "CAN"),
  men("Bart Swings", "BEL"),
  men("Yuma Murakami", "JPN"),
  men("Wataru Morishige", "JPN"),
  men("Tatsuya Shinhama", "JPN"),
  men("Metoděj Jílek", "CZE"),
  men("Cooper McLeod", "USA"),
  men("Casey Dawson", "USA"),
  women("Jutta Leerdam", "NED"),
  women("Femke Kok", "NED"),
  women("Joy Beune", "NED"),
  women("Antoinette Rijpma-de Jong", "NED"),
  women("Marijke Groenewoud", "NED"),
  women("Suzanne Schulting", "NED"),
  women("Angel Daleman", "NED"),
  women("Chloé Hoogendoorn", "NED"),
  women("Merel Conijn", "NED"),
  women("Jade Groenewoud", "NED"),
  women("Miho Takagi", "JPN"),
  women("Erin Jackson", "USA"),
  women("Kimi Goetz", "USA"),
  women("Brittany Bowe", "USA"),
  women("Ragne Wiklund", "NOR"),
  women("Isabelle Weidemann", "CAN"),
  women("Valérie Maltais", "CAN"),
  women("Ivanie Blondin", "CAN"),
  women("Martina Sáblíková", "CZE"),
  women("Francesca Lollobrigida", "ITA"),
  women("Han Mei", "CHN"),
  women("Kim Min-sun", "KOR"),
  women("Vanessa Herzog", "AUT"),
  women("Elizaveta Golubeva", "KAZ"),
  women("Karolina Bosiek", "POL"),
];

const SHORTTRACK_FAVOURITES: SeedSkater[] = [
  men("Jens van 't Wout", "NED"),
  men("Melle van 't Wout", "NED"),
  men("Friso Emons", "NED"),
  men("Teun Boer", "NED"),
  men("Itzhak de Laat", "NED"),
  men("William Dandjinou", "CAN"),
  men("Steven Dubois", "CAN"),
  men("Félix Roussel", "CAN"),
  men("Pietro Sighel", "ITA"),
  men("Thomas Nadalini", "ITA"),
  men("Park Ji-won", "KOR"),
  men("Jang Sung-woo", "KOR"),
  men("Kim Gun-woo", "KOR"),
  men("Lin Xiaojun", "CHN"),
  men("Sun Long", "CHN"),
  men("Liu Shaoang", "CHN"),
  men("Stijn Desmet", "BEL"),
  men("Roberts Krūzbergs", "LAT"),
  men("Shogo Miyata", "JPN"),
  men("Andrew Heo", "USA"),
  women("Xandra Velzeboer", "NED"),
  women("Suzanne Schulting", "NED"),
  women("Selma Poutsma", "NED"),
  women("Michelle Velzeboer", "NED"),
  women("Zoë Deltrap", "NED"),
  women("Courtney Sarault", "CAN"),
  women("Kim Boutin", "CAN"),
  women("Danaé Blais", "CAN"),
  women("Kim Gil-li", "KOR"),
  women("Choi Min-jeong", "KOR"),
  women("Arianna Fontana", "ITA"),
  women("Elisa Confortola", "ITA"),
  women("Kristen Santos-Griswold", "USA"),
  women("Corinne Stoddard", "USA"),
  women("Hanne Desmet", "BEL"),
  women("Fan Kexin", "CHN"),
  women("Zhang Chutong", "CHN"),
  women("Petra Jászapáti", "HUN"),
];

/**
 * Zonder dubbelen: dezelfde naam (hoofdletters negeren) in dezelfde
 * categorie. De eerste lijst wint; een foto uit een latere lijst vult aan.
 */
function merge(...lists: SeedSkater[][]): SeedSkater[] {
  const result = new Map<string, SeedSkater>();

  for (const skater of lists.flat()) {
    const key = `${skater.category}:${skater.name.toLowerCase()}`;
    const existing = result.get(key);

    if (!existing) {
      result.set(key, skater);
      continue;
    }

    if (!existing.imageUrl && skater.imageUrl) {
      result.set(key, { ...existing, imageUrl: skater.imageUrl });
    }
  }

  return [...result.values()];
}

/** Iedereen die we kennen: de favorieten, het veld van 2026 en het ISU-veld. */
export const SPEEDSKATERS = merge(
  SPEEDSKATING_FAVOURITES,
  SPEEDSKATING_FIELD,
  SPEEDSKATING_ISU_FIELD,
);
export const SHORTTRACKERS = merge(SHORTTRACK_FAVOURITES, SHORTTRACK_FIELD);

/** Landen die een aflossingsploeg sturen, met hun Nederlandse naam. */
export const RELAY_NATIONS: { nation: string; name: string }[] = [
  { nation: "NED", name: "Nederland" },
  { nation: "CAN", name: "Canada" },
  { nation: "KOR", name: "Zuid-Korea" },
  { nation: "CHN", name: "China" },
  { nation: "ITA", name: "Italië" },
  { nation: "USA", name: "Verenigde Staten" },
  { nation: "HUN", name: "Hongarije" },
  { nation: "BEL", name: "België" },
  { nation: "JPN", name: "Japan" },
  { nation: "POL", name: "Polen" },
];

export type SeedFormat = "massstart" | "relay" | "sprint" | "allround";

export interface SeedDistance {
  /** Lokale starttijd met tijdzone. */
  startsAt: string;
  category: SkatingCategory;
  distanceM?: number;
  format?: SeedFormat;
  /** Namen van de favorieten; leeg bij een aflossing (dan alle ploegen). */
  favourites: string[];
}

export interface SeedChampionship {
  key: string;
  name: string;
  shortName: string;
  /** Reeksen uit de module, bijv. "worldCup". */
  series: string[];
  distances: SeedDistance[];
}

/** Favorieten per categorie en afstand ("women:500", "men:massstart"). */
const SPEED_FAVOURITES: Record<string, string[]> = {
  "women:500": [
    "Femke Kok",
    "Erin Jackson",
    "Jutta Leerdam",
    "Kim Min-sun",
    "Miho Takagi",
    "Kimi Goetz",
    "Angel Daleman",
  ],
  "men:500": [
    "Jordan Stolz",
    "Jenning de Boo",
    "Laurent Dubreuil",
    "Damian Żurek",
    "Yuma Murakami",
    "Wataru Morishige",
    "Tatsuya Shinhama",
  ],
  "women:1000": [
    "Jutta Leerdam",
    "Femke Kok",
    "Miho Takagi",
    "Kimi Goetz",
    "Brittany Bowe",
    "Antoinette Rijpma-de Jong",
    "Suzanne Schulting",
  ],
  "men:1000": [
    "Jordan Stolz",
    "Jenning de Boo",
    "Joep Wennemars",
    "Ning Zhongyan",
    "Kjeld Nuis",
    "Laurent Dubreuil",
    "Cooper McLeod",
  ],
  "women:1500": [
    "Joy Beune",
    "Miho Takagi",
    "Antoinette Rijpma-de Jong",
    "Brittany Bowe",
    "Marijke Groenewoud",
    "Han Mei",
    "Ragne Wiklund",
  ],
  "men:1500": [
    "Jordan Stolz",
    "Kjeld Nuis",
    "Peder Kongshaug",
    "Connor Howe",
    "Ning Zhongyan",
    "Tim Prins",
    "Vladimir Semirunniy",
  ],
  "women:3000": [
    "Joy Beune",
    "Ragne Wiklund",
    "Martina Sáblíková",
    "Isabelle Weidemann",
    "Francesca Lollobrigida",
    "Merel Conijn",
    "Valérie Maltais",
  ],
  "women:5000": [
    "Joy Beune",
    "Ragne Wiklund",
    "Martina Sáblíková",
    "Merel Conijn",
    "Isabelle Weidemann",
    "Valérie Maltais",
    "Francesca Lollobrigida",
  ],
  "men:5000": [
    "Davide Ghiotto",
    "Sander Eitrem",
    "Patrick Roest",
    "Beau Snellink",
    "Metoděj Jílek",
    "Ted-Jan Bloemen",
    "Jorrit Bergsma",
  ],
  "men:10000": [
    "Davide Ghiotto",
    "Sander Eitrem",
    "Patrick Roest",
    "Metoděj Jílek",
    "Beau Snellink",
    "Ted-Jan Bloemen",
    "Jorrit Bergsma",
  ],
  "women:massstart": [
    "Marijke Groenewoud",
    "Ivanie Blondin",
    "Valérie Maltais",
    "Karolina Bosiek",
    "Francesca Lollobrigida",
    "Elizaveta Golubeva",
    "Jade Groenewoud",
  ],
  "men:massstart": [
    "Bart Swings",
    "Jorrit Bergsma",
    "Andrea Giovannini",
    "Chris Huizinga",
    "Stijn van de Bunt",
    "Cooper McLeod",
    "Casey Dawson",
  ],
  "women:sprint": [
    "Femke Kok",
    "Jutta Leerdam",
    "Angel Daleman",
    "Suzanne Schulting",
    "Vanessa Herzog",
    "Karolina Bosiek",
  ],
  "men:sprint": [
    "Jenning de Boo",
    "Joep Wennemars",
    "Kjeld Nuis",
    "Damian Żurek",
    "Tim Prins",
    "Marcel Bosker",
  ],
  "women:allround": [
    "Joy Beune",
    "Marijke Groenewoud",
    "Antoinette Rijpma-de Jong",
    "Ragne Wiklund",
    "Merel Conijn",
    "Martina Sáblíková",
    "Francesca Lollobrigida",
    "Karolina Bosiek",
  ],
  "men:allround": [
    "Patrick Roest",
    "Sander Eitrem",
    "Davide Ghiotto",
    "Beau Snellink",
    "Peder Kongshaug",
    "Metoděj Jílek",
    "Marcel Bosker",
  ],
};

const SHORT_FAVOURITES: Record<string, string[]> = {
  "women:500": [
    "Xandra Velzeboer",
    "Arianna Fontana",
    "Kim Boutin",
    "Selma Poutsma",
    "Fan Kexin",
    "Danaé Blais",
    "Michelle Velzeboer",
  ],
  "men:500": [
    "Steven Dubois",
    "Pietro Sighel",
    "Jens van 't Wout",
    "Liu Shaoang",
    "Sun Long",
    "Melle van 't Wout",
    "William Dandjinou",
  ],
  "women:1000": [
    "Xandra Velzeboer",
    "Courtney Sarault",
    "Kim Gil-li",
    "Suzanne Schulting",
    "Kristen Santos-Griswold",
    "Hanne Desmet",
    "Choi Min-jeong",
  ],
  "men:1000": [
    "William Dandjinou",
    "Jens van 't Wout",
    "Park Ji-won",
    "Pietro Sighel",
    "Lin Xiaojun",
    "Stijn Desmet",
    "Steven Dubois",
  ],
  "women:1500": [
    "Xandra Velzeboer",
    "Courtney Sarault",
    "Kim Gil-li",
    "Choi Min-jeong",
    "Kristen Santos-Griswold",
    "Suzanne Schulting",
    "Corinne Stoddard",
  ],
  "men:1500": [
    "Jens van 't Wout",
    "William Dandjinou",
    "Park Ji-won",
    "Lin Xiaojun",
    "Liu Shaoang",
    "Jang Sung-woo",
    "Roberts Krūzbergs",
  ],
};

/** Landen in Europa, voor de favorieten van een EK. */
const EUROPE = new Set([
  "NED",
  "BEL",
  "NOR",
  "ITA",
  "POL",
  "CZE",
  "AUT",
  "GER",
  "FRA",
  "HUN",
  "LAT",
  "SUI",
  "GBR",
]);

type Favourites = Record<string, string[]>;
type Skaters = SeedSkater[];

/** Eén afstand van een programma: "500", "massstart", "relay:2000", ... */
interface Slot {
  date: string;
  time: string;
  category: SkatingCategory;
  key: string;
}

function distanceFrom(
  slot: Slot,
  offset: string,
  favourites: Favourites,
  europeOnly: Skaters | null,
): SeedDistance {
  const startsAt = `${slot.date}T${slot.time}:00${offset}`;
  const [kind, meters] = slot.key.split(":");

  if (kind === "relay") {
    return {
      startsAt,
      category: slot.category,
      distanceM: Number(meters),
      format: "relay",
      favourites: [],
    };
  }

  const isFormat =
    kind === "massstart" || kind === "sprint" || kind === "allround";
  let names = favourites[`${slot.category}:${kind}`] ?? [];

  if (europeOnly) {
    const nationOf = new Map(
      europeOnly.map((skater) => [skater.name, skater.nation]),
    );
    names = names.filter((name) => EUROPE.has(nationOf.get(name) ?? ""));
  }

  return {
    startsAt,
    category: slot.category,
    distanceM: isFormat ? undefined : Number(kind),
    format: isFormat ? (kind as SeedFormat) : undefined,
    favourites: names,
  };
}

const days = (dates: string[]) => ({
  /** Programma per dag: [dag, tijd, categorie, afstand]. */
  program: (rows: [number, string, SkatingCategory, string][]): Slot[] =>
    rows.map(([day, time, category, key]) => ({
      date: dates[day],
      time,
      category,
      key,
    })),
});

/** World Cup: drie dagen, tien afstanden (programma geschat). */
function worldCup(dates: string[]): Slot[] {
  return days(dates).program([
    [0, "15:00", "women", "500"],
    [0, "15:30", "men", "500"],
    [0, "16:30", "women", "3000"],
    [0, "17:30", "men", "5000"],
    [1, "14:00", "women", "1000"],
    [1, "14:45", "men", "1000"],
    [1, "16:00", "women", "massstart"],
    [1, "16:30", "men", "massstart"],
    [2, "14:00", "women", "1500"],
    [2, "15:00", "men", "1500"],
  ]);
}

/** Shorttrack: finales op zaterdag en zondag (programma geschat). */
function shorttrackWeekend(dates: string[]): Slot[] {
  return days(dates).program([
    [1, "13:00", "women", "1500"],
    [1, "13:15", "men", "1500"],
    [1, "14:00", "women", "500"],
    [1, "14:15", "men", "500"],
    [1, "15:00", "relayMixed", "relay:2000"],
    [2, "13:00", "women", "1000"],
    [2, "13:15", "men", "1000"],
    [2, "14:00", "relayWomen", "relay:3000"],
    [2, "14:30", "relayMen", "relay:5000"],
  ]);
}

interface Edition {
  key: string;
  name: string;
  shortName: string;
  series: string[];
  dates: string[];
  /** UTC-offset van de plaats in de winter, bijv. "+01:00". */
  offset: string;
  slots: (dates: string[]) => Slot[];
  europeOnly?: boolean;
}

function build(
  edition: Edition,
  favourites: Favourites,
  skaters: Skaters,
): SeedChampionship {
  return {
    key: edition.key,
    name: edition.name,
    shortName: edition.shortName,
    series: edition.series,
    distances: edition
      .slots(edition.dates)
      .map((slot) =>
        distanceFrom(
          slot,
          edition.offset,
          favourites,
          edition.europeOnly ? skaters : null,
        ),
      ),
  };
}

const WC = ["worldCup"];
const CHAMPS = ["championships"];

/** WK Afstanden in Beijing: vier dagen, twaalf afstanden. */
function worldSingleDistances(dates: string[]): Slot[] {
  return days(dates).program([
    [0, "15:00", "women", "3000"],
    [0, "17:00", "men", "5000"],
    [1, "15:00", "women", "500"],
    [1, "17:00", "men", "500"],
    [2, "14:00", "women", "1500"],
    [2, "15:30", "men", "1500"],
    [2, "17:00", "women", "massstart"],
    [2, "17:30", "men", "massstart"],
    [3, "13:00", "women", "1000"],
    [3, "14:00", "men", "1000"],
    [3, "15:00", "women", "5000"],
    [3, "16:30", "men", "10000"],
  ]);
}

/** EK Allround en Sprint: sprintklassement op vrijdag, allround in het weekend. */
function europeanAllroundSprint(dates: string[]): Slot[] {
  return days(dates).program([
    [0, "17:00", "women", "sprint"],
    [0, "18:00", "men", "sprint"],
    [1, "13:00", "women", "allround"],
    [1, "14:00", "men", "allround"],
  ]);
}

const SPEED_EDITIONS: Edition[] = [
  {
    key: "wc-beijing-2026",
    name: "World Cup Beijing 2026",
    shortName: "WC Beijing",
    series: WC,
    dates: ["2026-11-13", "2026-11-14", "2026-11-15"],
    offset: "+08:00",
    slots: worldCup,
  },
  {
    key: "wc-obihiro-2026",
    name: "World Cup Obihiro 2026",
    shortName: "WC Obihiro",
    series: WC,
    dates: ["2026-11-20", "2026-11-21", "2026-11-22"],
    offset: "+09:00",
    slots: worldCup,
  },
  {
    key: "wc-heerenveen-2026",
    name: "World Cup Heerenveen 2026",
    shortName: "WC Heerenveen",
    series: WC,
    dates: ["2026-12-04", "2026-12-05", "2026-12-06"],
    offset: "+01:00",
    slots: worldCup,
  },
  {
    key: "wc-stavanger-2026",
    name: "World Cup Stavanger 2026",
    shortName: "WC Stavanger",
    series: WC,
    dates: ["2026-12-11", "2026-12-12", "2026-12-13"],
    offset: "+01:00",
    slots: worldCup,
  },
  {
    key: "ek-allround-sprint-2027",
    name: "EK Allround en Sprint 2027",
    shortName: "EK Allround en Sprint",
    series: CHAMPS,
    dates: ["2027-01-08", "2027-01-09", "2027-01-10"],
    offset: "+01:00",
    slots: europeanAllroundSprint,
    europeOnly: true,
  },
  {
    key: "wc-salt-lake-city-2027",
    name: "World Cup Salt Lake City 2027",
    shortName: "WC Salt Lake City",
    series: WC,
    dates: ["2027-01-29", "2027-01-30", "2027-01-31"],
    offset: "-07:00",
    slots: worldCup,
  },
  {
    key: "wc-calgary-2027",
    name: "World Cup Calgary 2027",
    shortName: "WC Calgary",
    series: WC,
    dates: ["2027-02-05", "2027-02-06", "2027-02-07"],
    offset: "-07:00",
    slots: worldCup,
  },
  {
    key: "wk-afstanden-2027",
    name: "WK Afstanden 2027",
    shortName: "WK Afstanden",
    series: CHAMPS,
    dates: ["2027-02-25", "2027-02-26", "2027-02-27", "2027-02-28"],
    offset: "+08:00",
    slots: worldSingleDistances,
  },
];

const WT = ["worldTour"];

const SHORT_EDITIONS: Edition[] = [
  {
    key: "wt-seoul-2026",
    name: "World Tour Seoul 2026",
    shortName: "WT Seoul",
    series: WT,
    dates: ["2026-11-20", "2026-11-21", "2026-11-22"],
    offset: "+09:00",
    slots: shorttrackWeekend,
  },
  {
    key: "wt-shanghai-2026",
    name: "World Tour Shanghai 2026",
    shortName: "WT Shanghai",
    series: WT,
    dates: ["2026-11-27", "2026-11-28", "2026-11-29"],
    offset: "+08:00",
    slots: shorttrackWeekend,
  },
  {
    key: "wt-beijing-2026",
    name: "World Tour Beijing 2026",
    shortName: "WT Beijing",
    series: WT,
    dates: ["2026-12-04", "2026-12-05", "2026-12-06"],
    offset: "+08:00",
    slots: shorttrackWeekend,
  },
  {
    key: "ek-shorttrack-2027",
    name: "EK Shorttrack 2027",
    shortName: "EK Shorttrack",
    series: CHAMPS,
    dates: ["2027-01-15", "2027-01-16", "2027-01-17"],
    offset: "+01:00",
    slots: shorttrackWeekend,
    europeOnly: true,
  },
  {
    key: "wt-gdansk-2027",
    name: "World Tour Gdańsk 2027",
    shortName: "WT Gdańsk",
    series: WT,
    dates: ["2027-02-05", "2027-02-06", "2027-02-07"],
    offset: "+01:00",
    slots: shorttrackWeekend,
  },
  {
    key: "wt-tilburg-2027",
    name: "World Tour Tilburg 2027",
    shortName: "WT Tilburg",
    series: WT,
    dates: ["2027-02-12", "2027-02-13", "2027-02-14"],
    offset: "+01:00",
    slots: shorttrackWeekend,
  },
  {
    key: "wk-shorttrack-2027",
    name: "WK Shorttrack 2027",
    shortName: "WK Shorttrack",
    series: CHAMPS,
    dates: ["2027-03-12", "2027-03-13", "2027-03-14"],
    offset: "+09:00",
    slots: shorttrackWeekend,
  },
];

/** Langebaanschaatsen 2026/27: zes World Cups, het EK en het WK Afstanden. */
export const SPEEDSKATING_2026_27: SeedChampionship[] = SPEED_EDITIONS.map(
  (edition) => build(edition, SPEED_FAVOURITES, SPEEDSKATERS),
);

/** Shorttrack 2026/27: vijf World Tour-wedstrijden, het EK en het WK. */
export const SHORTTRACK_2026_27: SeedChampionship[] = SHORT_EDITIONS.map(
  (edition) => build(edition, SHORT_FAVOURITES, SHORTTRACKERS),
);

/** Kleine test met vier afstanden, om locken en uitslagen te proberen. */
export const TEST_SPEEDSKATING: SeedChampionship = build(
  {
    key: "test-schaatsen",
    name: "Rivaly Schaatstest",
    shortName: "Schaatstest",
    series: [],
    dates: ["", "", ""],
    offset: "",
    slots: () => [
      { date: "", time: "", category: "women", key: "500" },
      { date: "", time: "", category: "men", key: "500" },
      { date: "", time: "", category: "women", key: "1000" },
      { date: "", time: "", category: "men", key: "massstart" },
    ],
  },
  SPEED_FAVOURITES,
  SPEEDSKATERS,
);
