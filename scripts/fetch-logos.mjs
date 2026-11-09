/**
 * Zet voor ontwikkeling logo's in Convex: van koersen en competities
 * (events.meta.logoUrl), clubwapens (participants.imageUrl) en een sfeerfoto
 * voor de Eredivisie. Bronnen, in volgorde:
 *   1. Wikidata "logo" (P154): bestanden op Wikimedia Commons.
 *   2. De hoofdafbeelding van het Engelse Wikipedia-artikel.
 *   3. TheSportsDB (clubwapens, competitielogo en -foto), met de openbare
 *      testsleutel.
 * Logo's zijn merken van de organisatoren en clubs. Voor een release moet een
 * beheerder ze vervangen door beeld met toestemming of via een datapartij.
 *
 * Draaien: `node scripts/fetch-logos.mjs` (alleen clubs: `--clubs-only`)
 */
import { execFileSync } from "node:child_process";

const USER_AGENT = "RivalyDevSeed/1.0 (development image lookup)";
const SPORTS_DB = "https://www.thesportsdb.com/api/v1/json/123";
const EREDIVISIE_LEAGUE_ID = "4337";

/** Wikipedia-artikel per evenement, op een deel van de slug. */
const EVENT_ARTICLES = {
  "tour-de-france": "Tour de France",
  "giro-d-italia": "Giro d'Italia",
  "vuelta-a-espana": "Vuelta a España",
  omloop: "Omloop Nieuwsblad",
  "strade-bianche": "Strade Bianche",
  "milano-sanremo": "Milan–San Remo",
  e3: "E3 Saxo Classic",
  "gent-wevelgem": "Gent–Wevelgem",
  "dwars-door-vlaanderen": "Dwars door Vlaanderen",
  "ronde-van-vlaanderen": "Tour of Flanders",
  "parijs-roubaix": "Paris–Roubaix",
  "amstel-gold-race": "Amstel Gold Race",
  "waalse-pijl": "La Flèche Wallonne",
  "luik-bastenaken-luik": "Liège–Bastogne–Liège",
  "ronde-van-lombardije": "Il Lombardia",
  eredivisie: "Eredivisie",
};

/** Clubcode (zoals in de seed) → Wikipedia-artikel en zoeknaam bij TheSportsDB. */
const CLUBS = {
  AJA: ["AFC Ajax", "Ajax"],
  PSV: ["PSV Eindhoven", "PSV Eindhoven"],
  FEY: ["Feyenoord", "Feyenoord"],
  AZ: ["AZ Alkmaar", "AZ Alkmaar"],
  TWE: ["FC Twente", "FC Twente"],
  UTR: ["FC Utrecht", "FC Utrecht"],
  NEC: ["NEC Nijmegen", "NEC Nijmegen"],
  HEE: ["SC Heerenveen", "Heerenveen"],
  GAE: ["Go Ahead Eagles", "Go Ahead Eagles"],
  SPA: ["Sparta Rotterdam", "Sparta Rotterdam"],
  FOR: ["Fortuna Sittard", "Fortuna Sittard"],
  PEC: ["PEC Zwolle", "PEC Zwolle"],
  HER: ["Heracles Almelo", "Heracles"],
  NAC: ["NAC Breda", "NAC Breda"],
  GRO: ["FC Groningen", "FC Groningen"],
  WIL: ["Willem II (football club)", "Willem II"],
  VOL: ["FC Volendam", "Volendam"],
  EXC: ["Excelsior Rotterdam", "Excelsior"],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function convex(fn, args) {
  const output = execFileSync(
    "npx",
    ["convex", "run", fn, JSON.stringify(args)],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );

  return JSON.parse(output.slice(output.search(/[[{0-9]/)));
}

async function getJson(url) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.ok) {
      await sleep(2500);
      return await response.json();
    }

    if (response.status !== 429) {
      throw new Error(`${url.host}: ${response.status}`);
    }

    console.log(`Te veel verzoeken, ${attempt * 30} s wachten...`);
    await sleep(attempt * 30_000);
  }

  throw new Error("Blijft verzoeken weigeren; probeer het later.");
}

/** Commons-bestand als PNG van 256 px breed (ook voor SVG). */
const commonsFile = (name) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=256`;

/** Logo's uit Wikidata (P154), per Wikipedia-titel. */
async function wikidataLogos(titles) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.search = new URLSearchParams({
    action: "wbgetentities",
    format: "json",
    sites: "enwiki",
    titles: titles.join("|"),
    props: "claims|sitelinks",
    sitefilter: "enwiki",
  }).toString();

  const data = await getJson(url);
  const logos = new Map();

  for (const entity of Object.values(data.entities ?? {})) {
    const title = entity.sitelinks?.enwiki?.title;
    const file = entity.claims?.P154?.[0]?.mainsnak?.datavalue?.value;

    if (title && file) {
      logos.set(title, commonsFile(file));
    }
  }

  return logos;
}

/** Hoofdafbeelding van Wikipedia-artikelen, alleen als het een logo is. */
async function wikipediaLogos(titles) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: "256",
    pilimit: "50",
    redirects: "1",
    titles: titles.join("|"),
  }).toString();

  const data = await getJson(url);
  const original = new Map(titles.map((title) => [title, title]));

  for (const step of [
    ...(data.query?.normalized ?? []),
    ...(data.query?.redirects ?? []),
  ]) {
    original.set(step.to, original.get(step.from) ?? step.from);
  }

  const logos = new Map();

  for (const page of data.query?.pages ?? []) {
    const isLogo = /logo|\.svg|\.png/i.test(page.pageimage ?? "");

    if (page.thumbnail?.source && isLogo) {
      logos.set(original.get(page.title) ?? page.title, page.thumbnail.source);
    }
  }

  return logos;
}

async function seedEventLogos() {
  const events = convex("seedImages:publicEvents", {});
  const articleOf = (slug) =>
    Object.entries(EVENT_ARTICLES).find(([part]) => slug.includes(part))?.[1];
  const articles = [
    ...new Set(events.map((event) => articleOf(event.slug)).filter(Boolean)),
  ];

  const logos = await wikidataLogos(articles);
  const missing = articles.filter((title) => !logos.has(title));

  for (const [title, url] of await wikipediaLogos(missing)) {
    logos.set(title, url);
  }

  const league = (
    await getJson(
      new URL(`${SPORTS_DB}/lookupleague.php?id=${EREDIVISIE_LEAGUE_ID}`),
    )
  ).leagues?.[0];

  const images = events
    .map((event) => {
      const isEredivisie = event.slug.includes("eredivisie");

      return {
        slug: event.slug,
        logoUrl:
          logos.get(articleOf(event.slug)) ??
          (isEredivisie ? league?.strBadge : undefined),
        ...(isEredivisie && league?.strFanart1
          ? { imageUrl: league.strFanart1 }
          : {}),
      };
    })
    .filter((image) => image.logoUrl || image.imageUrl);

  const updated = convex("seedImages:setEventImages", { images });
  const withLogo = images.filter((image) => image.logoUrl).length;
  console.log(`Evenementen: ${withLogo} met logo (${updated} bijgewerkt).`);
}

async function seedClubCrests() {
  const titles = Object.values(CLUBS).map(([title]) => title);
  const crests = await wikidataLogos(titles);
  const missing = titles.filter((title) => !crests.has(title));

  for (const [title, url] of await wikipediaLogos(missing)) {
    crests.set(title, url);
  }

  const images = [];

  for (const [code, [title, searchName]] of Object.entries(CLUBS)) {
    const crest = crests.get(title) ?? (await sportsDbBadge(searchName));

    if (crest) {
      images.push({ code, imageUrl: crest });
    } else {
      console.log(`Geen wapen gevonden voor ${title}.`);
    }
  }

  const updated = convex("seedImages:setParticipantImages", {
    moduleKey: "football",
    images,
  });
  console.log(
    `Clubs: ${images.length} van ${titles.length} met wapen (${updated} deelnemers).`,
  );
}

/**
 * Clubwapen van TheSportsDB als aanvulling. Eén poging: de openbare
 * testsleutel wordt door iedereen gedeeld en is vaak druk, dus bij een
 * weigering slaan we de club over in plaats van te wachten.
 */
async function sportsDbBadge(name) {
  const response = await fetch(
    `${SPORTS_DB}/searchteams.php?t=${encodeURIComponent(name)}`,
    { headers: { "User-Agent": USER_AGENT } },
  );

  if (!response.ok) {
    return null;
  }

  const teams = (await response.json()).teams ?? [];
  const team = teams.find(
    (candidate) =>
      candidate.strSport === "Soccer" &&
      (candidate.strCountry === "Netherlands" ||
        /dutch|eredivisie|eerste divisie/i.test(candidate.strLeague ?? "")),
  );

  await sleep(2500);
  return team?.strBadge ?? null;
}

async function main() {
  if (!process.argv.includes("--clubs-only")) {
    await seedEventLogos();
  }

  await seedClubCrests();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
