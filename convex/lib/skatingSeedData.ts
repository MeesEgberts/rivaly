import type { SkatingCategory } from "../../modules/skating/categories";

/**
 * Testgegevens voor schaatsen en shorttrack: atleten per categorie en de
 * WK's van 2027. Data, tijden en deelnemers zijn schattingen; pas ze aan
 * zodra het officiële programma er is.
 */

export interface SeedSkater {
  name: string;
  /** Landcode voor de vlag, bijv. "NED". */
  nation: string;
  category: SkatingCategory;
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

export const SPEEDSKATERS: SeedSkater[] = [
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

export const SHORTTRACKERS: SeedSkater[] = [
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

export interface SeedDistance {
  /** Lokale starttijd met tijdzone. */
  startsAt: string;
  category: SkatingCategory;
  distanceM?: number;
  format?: "massstart" | "relay";
  /** Namen van de favorieten; leeg bij een aflossing (dan alle ploegen). */
  favourites: string[];
}

export interface SeedChampionship {
  key: string;
  name: string;
  shortName: string;
  distances: SeedDistance[];
}

const at = (date: string, time: string) => `${date}T${time}:00+01:00`;

/** WK Afstanden 2027: vier dagen, twaalf afstanden (schatting). */
export const WK_AFSTANDEN_2027: SeedChampionship = {
  key: "wk-afstanden-2027",
  name: "WK Afstanden 2027",
  shortName: "WK Afstanden",
  distances: [
    {
      startsAt: at("2027-03-04", "15:00"),
      category: "women",
      distanceM: 3000,
      favourites: [
        "Joy Beune",
        "Ragne Wiklund",
        "Martina Sáblíková",
        "Isabelle Weidemann",
        "Francesca Lollobrigida",
        "Merel Conijn",
        "Valérie Maltais",
      ],
    },
    {
      startsAt: at("2027-03-04", "17:00"),
      category: "men",
      distanceM: 5000,
      favourites: [
        "Davide Ghiotto",
        "Sander Eitrem",
        "Patrick Roest",
        "Beau Snellink",
        "Metoděj Jílek",
        "Ted-Jan Bloemen",
        "Jorrit Bergsma",
      ],
    },
    {
      startsAt: at("2027-03-05", "15:00"),
      category: "women",
      distanceM: 500,
      favourites: [
        "Femke Kok",
        "Erin Jackson",
        "Jutta Leerdam",
        "Kim Min-sun",
        "Miho Takagi",
        "Kimi Goetz",
        "Angel Daleman",
      ],
    },
    {
      startsAt: at("2027-03-05", "17:00"),
      category: "men",
      distanceM: 500,
      favourites: [
        "Jordan Stolz",
        "Jenning de Boo",
        "Laurent Dubreuil",
        "Damian Żurek",
        "Yuma Murakami",
        "Wataru Morishige",
        "Tatsuya Shinhama",
      ],
    },
    {
      startsAt: at("2027-03-06", "14:00"),
      category: "women",
      distanceM: 1500,
      favourites: [
        "Joy Beune",
        "Miho Takagi",
        "Antoinette Rijpma-de Jong",
        "Brittany Bowe",
        "Marijke Groenewoud",
        "Han Mei",
        "Ragne Wiklund",
      ],
    },
    {
      startsAt: at("2027-03-06", "15:30"),
      category: "men",
      distanceM: 1500,
      favourites: [
        "Jordan Stolz",
        "Kjeld Nuis",
        "Peder Kongshaug",
        "Connor Howe",
        "Ning Zhongyan",
        "Tim Prins",
        "Vladimir Semirunniy",
      ],
    },
    {
      startsAt: at("2027-03-06", "17:00"),
      category: "women",
      format: "massstart",
      favourites: [
        "Marijke Groenewoud",
        "Ivanie Blondin",
        "Valérie Maltais",
        "Karolina Bosiek",
        "Francesca Lollobrigida",
        "Elizaveta Golubeva",
        "Jade Groenewoud",
      ],
    },
    {
      startsAt: at("2027-03-06", "17:30"),
      category: "men",
      format: "massstart",
      favourites: [
        "Bart Swings",
        "Jorrit Bergsma",
        "Andrea Giovannini",
        "Chris Huizinga",
        "Stijn van de Bunt",
        "Cooper McLeod",
        "Casey Dawson",
      ],
    },
    {
      startsAt: at("2027-03-07", "13:00"),
      category: "women",
      distanceM: 1000,
      favourites: [
        "Jutta Leerdam",
        "Femke Kok",
        "Miho Takagi",
        "Kimi Goetz",
        "Brittany Bowe",
        "Antoinette Rijpma-de Jong",
        "Suzanne Schulting",
      ],
    },
    {
      startsAt: at("2027-03-07", "14:00"),
      category: "men",
      distanceM: 1000,
      favourites: [
        "Jordan Stolz",
        "Jenning de Boo",
        "Joep Wennemars",
        "Ning Zhongyan",
        "Kjeld Nuis",
        "Laurent Dubreuil",
        "Cooper McLeod",
      ],
    },
    {
      startsAt: at("2027-03-07", "15:00"),
      category: "women",
      distanceM: 5000,
      favourites: [
        "Joy Beune",
        "Ragne Wiklund",
        "Martina Sáblíková",
        "Merel Conijn",
        "Isabelle Weidemann",
        "Valérie Maltais",
        "Francesca Lollobrigida",
      ],
    },
    {
      startsAt: at("2027-03-07", "16:30"),
      category: "men",
      distanceM: 10000,
      favourites: [
        "Davide Ghiotto",
        "Sander Eitrem",
        "Patrick Roest",
        "Metoděj Jílek",
        "Beau Snellink",
        "Ted-Jan Bloemen",
        "Jorrit Bergsma",
      ],
    },
  ],
};

/** WK Shorttrack 2027: finales op zaterdag en zondag (schatting). */
export const WK_SHORTTRACK_2027: SeedChampionship = {
  key: "wk-shorttrack-2027",
  name: "WK Shorttrack 2027",
  shortName: "WK Shorttrack",
  distances: [
    {
      startsAt: at("2027-03-13", "14:00"),
      category: "women",
      distanceM: 1500,
      favourites: [
        "Xandra Velzeboer",
        "Courtney Sarault",
        "Kim Gil-li",
        "Choi Min-jeong",
        "Kristen Santos-Griswold",
        "Suzanne Schulting",
        "Corinne Stoddard",
      ],
    },
    {
      startsAt: at("2027-03-13", "14:15"),
      category: "men",
      distanceM: 1500,
      favourites: [
        "Jens van 't Wout",
        "William Dandjinou",
        "Park Ji-won",
        "Lin Xiaojun",
        "Liu Shaoang",
        "Jang Sung-woo",
        "Roberts Krūzbergs",
      ],
    },
    {
      startsAt: at("2027-03-13", "15:00"),
      category: "women",
      distanceM: 500,
      favourites: [
        "Xandra Velzeboer",
        "Arianna Fontana",
        "Kim Boutin",
        "Selma Poutsma",
        "Fan Kexin",
        "Danaé Blais",
        "Michelle Velzeboer",
      ],
    },
    {
      startsAt: at("2027-03-13", "15:15"),
      category: "men",
      distanceM: 500,
      favourites: [
        "Steven Dubois",
        "Pietro Sighel",
        "Jens van 't Wout",
        "Liu Shaoang",
        "Sun Long",
        "Melle van 't Wout",
        "William Dandjinou",
      ],
    },
    {
      startsAt: at("2027-03-13", "16:00"),
      category: "relayMixed",
      distanceM: 2000,
      format: "relay",
      favourites: [],
    },
    {
      startsAt: at("2027-03-14", "14:00"),
      category: "women",
      distanceM: 1000,
      favourites: [
        "Xandra Velzeboer",
        "Courtney Sarault",
        "Kim Gil-li",
        "Suzanne Schulting",
        "Kristen Santos-Griswold",
        "Hanne Desmet",
        "Choi Min-jeong",
      ],
    },
    {
      startsAt: at("2027-03-14", "14:15"),
      category: "men",
      distanceM: 1000,
      favourites: [
        "William Dandjinou",
        "Jens van 't Wout",
        "Park Ji-won",
        "Pietro Sighel",
        "Lin Xiaojun",
        "Stijn Desmet",
        "Steven Dubois",
      ],
    },
    {
      startsAt: at("2027-03-14", "15:00"),
      category: "relayWomen",
      distanceM: 3000,
      format: "relay",
      favourites: [],
    },
    {
      startsAt: at("2027-03-14", "15:30"),
      category: "relayMen",
      distanceM: 5000,
      format: "relay",
      favourites: [],
    },
  ],
};

/** Kleine test met vier afstanden, om locken en uitslagen te proberen. */
export const TEST_SPEEDSKATING: SeedChampionship = {
  key: "test-schaatsen",
  name: "Rivaly Schaatstest",
  shortName: "Schaatstest",
  distances: [
    {
      startsAt: "",
      category: "women",
      distanceM: 500,
      favourites: WK_AFSTANDEN_2027.distances[2].favourites,
    },
    {
      startsAt: "",
      category: "men",
      distanceM: 500,
      favourites: WK_AFSTANDEN_2027.distances[3].favourites,
    },
    {
      startsAt: "",
      category: "women",
      distanceM: 1000,
      favourites: WK_AFSTANDEN_2027.distances[8].favourites,
    },
    {
      startsAt: "",
      category: "men",
      format: "massstart",
      favourites: WK_AFSTANDEN_2027.distances[7].favourites,
    },
  ],
};
