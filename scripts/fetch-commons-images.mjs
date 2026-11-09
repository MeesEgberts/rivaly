/**
 * Zoekt voor ontwikkeling beeld op Wikimedia Commons en zet het in Convex:
 * een portret per renner en een foto per koers. Alleen bestanden van
 * Commons (vrije licenties); logo's van organisatoren zijn beschermd en
 * worden overgeslagen. Bij gebruik in productie is naamsvermelding nodig
 * (meestal CC BY-SA), dus laat een beheerder dit dan zelf kiezen.
 *
 * Draaien: `node scripts/fetch-commons-images.mjs` (alleen koersen:
 * `--events-only`). Wikimedia staat weinig anonieme verzoeken toe; het
 * script wacht vanzelf als het te snel gaat.
 */
import { execFileSync } from "node:child_process";

const USER_AGENT = "RivalyDevSeed/1.0 (development image lookup)";
const SPORT = "cycling";

/** Wikipedia-artikel per koers, op een deel van de slug. */
const RACE_ARTICLES = {
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
};

function convex(fn, args) {
  const output = execFileSync(
    "npx",
    ["convex", "run", fn, JSON.stringify(args)],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );

  return JSON.parse(output.slice(output.search(/[[{0-9]/)));
}

const BATCH = 50;
const PAUSE_MS = 3000;

/** Een foto (JPEG), geen logo of tekening. */
const isPhoto = (url) => /\.jpe?g/i.test(url) && !/\.svg/i.test(url);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** JSON van Wikimedia; bij een 429 (te veel verzoeken) wachten en opnieuw. */
async function getJson(url) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.ok) {
      await sleep(PAUSE_MS);
      return await response.json();
    }

    if (response.status !== 429) {
      throw new Error(`Wikimedia: ${response.status} ${await response.text()}`);
    }

    console.log(`Te veel verzoeken, ${attempt * 30} s wachten...`);
    await sleep(attempt * 30_000);
  }

  throw new Error("Wikimedia blijft verzoeken weigeren; probeer het later.");
}

/**
 * Hoofdfoto's van Wikipedia-artikelen, 50 titels per verzoek (zo vraagt
 * Wikimedia het). Geeft per opgevraagde titel de Commons-URL, of niets.
 */
async function pageImages(titles, size) {
  const result = new Map();

  for (let start = 0; start < titles.length; start += BATCH) {
    const batch = titles.slice(start, start + BATCH);
    const url = new URL("https://en.wikipedia.org/w/api.php");
    url.search = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: String(size),
      pilimit: String(BATCH),
      redirects: "1",
      titles: batch.join("|"),
    }).toString();

    const data = await getJson(url);

    // Terug van de uiteindelijke titel naar wat we vroegen.
    const original = new Map(batch.map((title) => [title, title]));

    for (const step of [
      ...(data.query?.normalized ?? []),
      ...(data.query?.redirects ?? []),
    ]) {
      original.set(step.to, original.get(step.from) ?? step.from);
    }

    for (const page of data.query?.pages ?? []) {
      const source = page.thumbnail?.source;

      // Alleen foto's van Commons: daar staan vrij gelicentieerde bestanden.
      // Logo's (SVG) zijn merken en horen hier niet bij.
      if (source?.includes("/wikipedia/commons/") && isPhoto(source)) {
        result.set(original.get(page.title) ?? page.title, source);
      }
    }
  }

  return result;
}

/**
 * Een liggende foto van een koers, direct gezocht op Commons, voor als het
 * Wikipedia-artikel alleen een logo als hoofdbeeld heeft.
 */
async function commonsPhoto(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|size|mime",
    iiurlwidth: "1200",
  }).toString();

  const data = await getJson(url);
  const pages = [...(data.query?.pages ?? [])].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );
  const photo = pages
    .map((page) => page.imageinfo?.[0])
    .find(
      (info) =>
        info?.mime === "image/jpeg" && info.width > info.height * 1.2,
    );

  return photo?.thumburl ?? null;
}

async function main() {
  if (!process.argv.includes("--events-only")) {
    await seedAthletes();
  }

  await seedEvents();
}

async function seedAthletes() {
  const names = convex("seedImages:athleteNames", { sport: SPORT });
  const portraits = await pageImages(names, 400);

  const athletesUpdated = convex("seedImages:setAthleteImages", {
    sport: SPORT,
    images: [...portraits].map(([name, imageUrl]) => ({ name, imageUrl })),
  });
  console.log(`Renners: ${athletesUpdated} van ${names.length} met foto.`);
}

async function seedEvents() {
  const events = convex("seedImages:publicEvents", {});
  const articleOf = (slug) =>
    Object.entries(RACE_ARTICLES).find(([part]) => slug.includes(part))?.[1];
  const articles = [
    ...new Set(events.map((event) => articleOf(event.slug)).filter(Boolean)),
  ];
  const photos = await pageImages(articles, 1200);

  for (const article of articles) {
    if (!photos.has(article)) {
      const photo = await commonsPhoto(`${article} cycling race`);

      if (photo) {
        photos.set(article, photo);
      }
    }
  }

  // Ook koersen zonder foto meesturen (null), zodat een eerdere verkeerde
  // treffer, zoals een logo, weer verdwijnt.
  const eventImages = events
    .filter((event) => articleOf(event.slug))
    .map((event) => ({
      slug: event.slug,
      imageUrl: photos.get(articleOf(event.slug)) ?? null,
    }));

  const eventsUpdated = convex("seedImages:setEventImages", {
    images: eventImages,
  });
  const withPhoto = eventImages.filter((image) => image.imageUrl).length;
  console.log(`Koersen: ${withPhoto} van ${eventsUpdated} met foto.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
