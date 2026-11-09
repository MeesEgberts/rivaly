/**
 * Beeld voor schaatsen en shorttrack (alleen voor ontwikkeling):
 *   - een portret per schaatser: Wikidata "afbeelding" (P18), via het
 *     Wikipedia-artikel; alleen als de beschrijving over schaatsen gaat;
 *   - een banner per toernooi: een foto van de ijsbaan;
 *   - als logo het logo van de ISU (Wikidata "logo", P154).
 * Bestanden komen van Wikimedia Commons. Logo's zijn merken; voor een release
 * moet een beheerder dit beeld vervangen of laten vastleggen.
 *
 * Draaien: `node scripts/fetch-skating-images.mjs`
 */
import { execFileSync } from "node:child_process";

const USER_AGENT = "RivalyDevSeed/1.0 (development image lookup)";
const SPORTS = ["speedskating", "shorttrack"];
const PAUSE_MS = 1500;

/** Aflossingsploegen zijn landen; die krijgen geen portret. */
const RELAY_TEAMS = new Set([
  "Nederland",
  "Canada",
  "Zuid-Korea",
  "China",
  "Italië",
  "Verenigde Staten",
  "Hongarije",
  "België",
  "Japan",
  "Polen",
]);

/** IJsbaan per toernooi, op een deel van de slug. */
const VENUES = [
  ["wc-beijing", "National Speed Skating Oval"],
  ["wk-afstanden", "National Speed Skating Oval"],
  ["obihiro", "Meiji Hokkaido-Tokachi Oval"],
  ["heerenveen", "Thialf"],
  ["ek-allround", "Thialf"],
  ["stavanger", "Sørmarka Arena"],
  ["salt-lake-city", "Utah Olympic Oval"],
  ["calgary", "Olympic Oval"],
  ["speedskating-test", "Thialf"],
  ["wt-seoul", "Mokdong Ice Rink"],
  ["wk-shorttrack", "Mokdong Ice Rink"],
  ["shanghai", "Shanghai Oriental Sports Center"],
  ["wt-beijing", "Capital Indoor Stadium"],
  ["ek-shorttrack", "EnergieVerbund Arena"],
  ["gdansk", "Hala Olivia"],
  ["tilburg", "Ireen Wüst IJsbaan"],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function convex(fn, args) {
  const output = execFileSync(
    "npx",
    ["convex", "run", fn, JSON.stringify(args)],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    },
  );

  return JSON.parse(output.slice(output.search(/[[{0-9]/)));
}

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
      throw new Error(`Wikimedia: ${response.status}`);
    }

    console.log(`Te veel verzoeken, ${attempt * 30} s wachten...`);
    await sleep(attempt * 30_000);
  }

  throw new Error("Wikimedia blijft verzoeken weigeren; probeer het later.");
}

function api(host, params) {
  const url = new URL(`https://${host}/w/api.php`);
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  }).toString();
  return getJson(url);
}

/** Commons-bestand → URL van een verkleinde versie. */
const fileUrl = (file, width) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replaceAll(" ", "_"))}?width=${width}`;

/** Wikidata-id per Wikipedia-titel (null bij een doorverwijspagina). */
async function wikidataIds(titles) {
  const ids = new Map();

  for (let start = 0; start < titles.length; start += 50) {
    const batch = titles.slice(start, start + 50);
    const data = await api("en.wikipedia.org", {
      action: "query",
      prop: "pageprops",
      ppprop: "wikibase_item|disambiguation",
      redirects: "1",
      titles: batch.join("|"),
    });
    const original = new Map(batch.map((title) => [title, title]));

    for (const step of [
      ...(data.query?.normalized ?? []),
      ...(data.query?.redirects ?? []),
    ]) {
      original.set(step.to, original.get(step.from) ?? step.from);
    }

    for (const page of data.query?.pages ?? []) {
      const props = page.pageprops;

      if (props?.wikibase_item && props.disambiguation === undefined) {
        ids.set(original.get(page.title) ?? page.title, props.wikibase_item);
      }
    }
  }

  return ids;
}

/** Wikidata-entiteiten: Engelse beschrijving en de bestanden van P18/P154. */
async function entities(ids) {
  const result = new Map();
  const list = [...new Set(ids)];

  for (let start = 0; start < list.length; start += 50) {
    const data = await api("www.wikidata.org", {
      action: "wbgetentities",
      ids: list.slice(start, start + 50).join("|"),
      props: "claims|descriptions",
      languages: "en",
    });

    for (const [id, entity] of Object.entries(data.entities ?? {})) {
      const file = (property) =>
        entity.claims?.[property]?.[0]?.mainsnak?.datavalue?.value ?? null;
      result.set(id, {
        description: entity.descriptions?.en?.value ?? "",
        image: file("P18"),
        logo: file("P154"),
      });
    }
  }

  return result;
}

/** Wikipedia-titels om te proberen: eerst de naam, dan met "(speed skater)". */
const candidates = (name) => [
  name,
  `${name} (speed skater)`,
  `${name} (short track speed skater)`,
  `${name} (skater)`,
];

async function portraits(names) {
  const titles = names.flatMap(candidates);
  const ids = await wikidataIds(titles);
  const info = await entities([...ids.values()]);
  const result = new Map();

  for (const name of names) {
    for (const title of candidates(name)) {
      const entity = info.get(ids.get(title));

      // Alleen echte schaatsers: anders kan een naamgenoot de foto leveren.
      if (entity?.image && /skat/i.test(entity.description)) {
        result.set(name, fileUrl(entity.image, 400));
        break;
      }
    }
  }

  return result;
}

/** Kleine letters zonder accenten, om bestandsnamen te vergelijken. */
const plain = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]/g, " ");

/**
 * Zoekt op Commons een foto waarvan de bestandsnaam de hele naam bevat.
 * `landscape` voor banners (breder dan hoog).
 */
async function commonsPhoto(
  query,
  mustContain,
  { landscape = false, width = 400 } = {},
) {
  const data = await api("commons.wikimedia.org", {
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|size|mime",
    iiurlwidth: String(width),
  });
  const pages = [...(data.query?.pages ?? [])].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );

  for (const page of pages) {
    const info = page.imageinfo?.[0];

    if (!info || !/image\/(jpeg|png)/.test(info.mime)) {
      continue;
    }

    if (mustContain && !plain(page.title).includes(plain(mustContain))) {
      continue;
    }

    if (landscape && info.width < info.height * 1.2) {
      continue;
    }

    return info.thumburl;
  }

  return null;
}

async function seedAthletes() {
  for (const sport of SPORTS) {
    const names = convex("seedImages:athleteNames", { sport }).filter(
      (name) => !RELAY_TEAMS.has(name),
    );
    const found = await portraits(names);

    for (const name of names.filter((name) => !found.has(name))) {
      const photo = await commonsPhoto(`"${name}"`, name);

      if (photo) {
        found.set(name, photo);
      }
    }

    const updated = convex("seedImages:setAthleteImages", {
      sport,
      images: [...found].map(([name, imageUrl]) => ({ name, imageUrl })),
    });
    const missing = names.filter((name) => !found.has(name));

    console.log(`${sport}: ${updated} van ${names.length} met foto.`);

    if (missing.length > 0) {
      console.log(`  zonder foto: ${missing.join(", ")}`);
    }
  }
}

/** Andere namen van een ijsbaan om op Commons te zoeken. */
const VENUE_SEARCH = {
  "Mokdong Ice Rink": ["Mokdong Ice Rink", "Mokdong"],
  "Ireen Wüst IJsbaan": ["IJsbaan Tilburg", "Ireen Wust"],
};

const venueCache = new Map();

/** Liggende foto van een ijsbaan op Commons, als Wikidata er geen heeft. */
async function venuePhoto(venue) {
  if (!venueCache.has(venue)) {
    let photo = null;

    for (const query of VENUE_SEARCH[venue] ?? [venue]) {
      photo = await commonsPhoto(query, query.split(" ")[0], {
        landscape: true,
        width: 1200,
      });

      if (photo) {
        break;
      }
    }

    venueCache.set(venue, photo);
  }

  return venueCache.get(venue);
}

async function seedEvents() {
  const venues = [...new Set(VENUES.map(([, venue]) => venue))];
  const ids = await wikidataIds([...venues, "International Skating Union"]);
  const info = await entities([...ids.values()]);
  const isu = info.get(ids.get("International Skating Union"));
  const logoUrl = isu?.logo ? fileUrl(isu.logo, 400) : undefined;

  const events = convex("seedImages:publicEvents", {});
  const images = [];

  for (const event of events) {
    if (!SPORTS.some((sport) => event.slug.startsWith(`${sport}-`))) {
      continue;
    }

    const venue = VENUES.find(([part]) => event.slug.includes(part))?.[1];
    const photo = venue ? info.get(ids.get(venue))?.image : null;
    const banner = photo
      ? fileUrl(photo, 1200)
      : venue
        ? await venuePhoto(venue)
        : null;

    images.push({
      slug: event.slug,
      imageUrl: banner,
      ...(logoUrl ? { logoUrl } : {}),
    });
  }

  const updated = convex("seedImages:setEventImages", { images });
  const withPhoto = images.filter((image) => image.imageUrl).length;

  console.log(
    `Toernooien: ${withPhoto} van ${updated} met banner, logo: ${logoUrl ? "ja" : "nee"}.`,
  );

  for (const event of images.filter((image) => !image.imageUrl)) {
    console.log(`  geen banner voor ${event.slug}`);
  }
}

async function main() {
  await seedAthletes();
  await seedEvents();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
