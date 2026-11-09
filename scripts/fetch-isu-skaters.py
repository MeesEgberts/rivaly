"""
Haalt het volledige langebaanveld op: alle deelnemers aan de seniorwedstrijden
van de ISU (World Cups, EK, WK, Spelen) uit api.isuresults.eu, met hun
officiële portretfoto, plus de deelnemers aan het Nederlandse
World Cup-kwalificatietoernooi van speedskatingresults.com. Dat laatste vangt
schaatsers die dit seizoen voor het eerst World Cup rijden, zolang de ISU de
inschrijvingen nog niet heeft gepubliceerd.

Schaatsers die al in `skatingFields2026.ts` of de favorieten staan, houden
daar hun naam; ze krijgen hier alleen hun foto.

Draaien: python3 -I scripts/fetch-isu-skaters.py
Daarna: npx convex run seedSkating:season2026_27
"""
import html, json, re, sys, time, unicodedata, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "convex/lib/skatingFieldIsu.ts"
UA = {"User-Agent": "RivalyDevSeed/1.0 (development data)"}
API = "https://api.isuresults.eu"

# Seizoenen volgens de ISU: 2026 = 2025/26, 2027 = 2026/27.
SEASONS = [2026, 2027]
SENIOR_TAGS = {"world-cup", "world", "european", "olympic"}

# Nederlandse World Cup-kwalificatietoernooien (speedskatingresults.com).
QUALIFIERS = [32244]

# Familienaam eerst, zoals op Wikipedia.
FAMILY_FIRST = {"KOR", "CHN", "PRK", "TPE"}
PARTICLES = {"de", "van", "der", "den", "ter", "te", "het", "la", "le", "von"}


def get(url, as_json=True):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                body = r.read().decode("utf-8")
                return json.loads(body) if as_json else body
        except Exception:
            time.sleep(3 * (attempt + 1))
    return [] if as_json else ""


def plain(name):
    """Sleutel om dezelfde schaatser onder andere schrijfwijze te herkennen."""
    folded = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    # Letters zonder volgorde: vangt "Cho Seung-min" = "Seungmin Cho".
    return "".join(sorted(re.sub(r"[^a-z]", "", folded)))


def title_case(upper):
    """'RIJPMA-DE JONG' → 'Rijpma-de Jong', 'de BOO' → 'de Boo'."""
    def word(w):
        if w.lower() in PARTICLES:
            return w.lower()
        return w[:1].upper() + w[1:].lower()

    return "".join(word(p) if p.strip() not in ("", "-") else p for p in re.split(r"(\s+|-)", upper))


def known_names():
    """Namen die al in de seed staan, per categorie."""
    known = {}
    for file in ["convex/lib/skatingFields2026.ts", "convex/lib/skatingSeedData.ts"]:
        text = (ROOT / file).read_text()
        for category, name in re.findall(r'\b(men|women)\("([^"]+)"', text):
            known.setdefault((category, plain(name)), name)
    return known


def isu_skaters():
    skaters = {}
    for season in SEASONS:
        events = get(f"{API}/events/?season={season}").get("results", [])
        for event in events:
            if "junior" in event["tags"] or not SENIOR_TAGS & set(event["tags"]):
                continue
            competitors = get(f"{API}/events/{event['isuId']}/competitors/")
            print(event["isuId"], event["name"], len(competitors), file=sys.stderr)
            for c in competitors:
                s = c.get("skater")
                if not s or s["gender"] not in ("M", "F"):
                    continue
                first, last = s["firstName"].strip(), s["lastName"].strip()
                if last.isupper():
                    last = title_case(last)
                name = f"{last} {first}" if s["country"] in FAMILY_FIRST else f"{first} {last}"
                category = "men" if s["gender"] == "M" else "women"
                row = skaters.setdefault((category, plain(name)), {
                    "name": name, "nation": s["country"], "category": category, "imageUrl": None,
                })
                if s.get("photo"):
                    row["imageUrl"] = s["photo"]
    return skaters


def qualifier_skaters():
    skaters = {}
    link = re.compile(r'p=17&amp;s=\d+">([^<]+)<')
    for comp in QUALIFIERS:
        for gender, category in [(0, "women"), (1, "men")]:
            page = get(f"https://speedskatingresults.com/index.php?p=4&e={comp}&g={gender}", as_json=False)
            names = {html.unescape(m) for m in link.findall(page)}
            print("kwalificatie", comp, category, len(names), file=sys.stderr)
            for raw in names:
                # Familienaam staat in hoofdletters: "Jenning de BOO".
                words = raw.split()
                split = next(i for i, w in enumerate(words) if w.isupper() or i == len(words) - 1)
                while split > 0 and words[split - 1].lower() in PARTICLES:
                    split -= 1
                name = " ".join(words[:split] + [title_case(" ".join(words[split:]))])
                skaters.setdefault((category, plain(name)), {
                    "name": name, "nation": "NED", "category": category, "imageUrl": None,
                })
    return skaters


def main():
    known = known_names()
    found = qualifier_skaters()
    for key, row in isu_skaters().items():
        if key in found and not row["imageUrl"]:
            row["imageUrl"] = found[key]["imageUrl"]
        found[key] = row

    rows = []
    for key, row in found.items():
        # Bestaande schaatsers houden hun naam uit de seed, zodat de foto past.
        row["name"] = known.get(key, row["name"])
        rows.append(row)
    rows.sort(key=lambda r: (r["category"], r["name"]))

    new = sum(1 for r in rows if (r["category"], plain(r["name"])) not in known)
    photos = sum(1 for r in rows if r["imageUrl"])
    print(f"{len(rows)} schaatsers, {new} nieuw, {photos} met foto", file=sys.stderr)

    lines = [
        'import type { SeedSkater } from "./skatingSeedData";',
        "",
        "/**",
        " * Volledig langebaanveld: alle deelnemers aan de seniorwedstrijden van de",
        " * ISU plus het Nederlandse World Cup-kwalificatietoernooi, met de officiële",
        " * ISU-portretfoto. Gegenereerd door `scripts/fetch-isu-skaters.py`; niet",
        " * met de hand aanpassen.",
        " */",
        "export const SPEEDSKATING_ISU_FIELD: SeedSkater[] = [",
    ]
    for r in rows:
        image = f", imageUrl: {json.dumps(r['imageUrl'])}" if r["imageUrl"] else ""
        lines.append(
            f'  {{ name: {json.dumps(r["name"], ensure_ascii=False)}, nation: "{r["nation"]}", category: "{r["category"]}"{image} }},'
        )
    lines.append("];")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"geschreven: {OUT.relative_to(ROOT)}", file=sys.stderr)


main()
