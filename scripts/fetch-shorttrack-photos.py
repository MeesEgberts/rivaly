"""
Vult ontbrekende portretfoto's van shorttrackers aan via Wikidata. De ISU-API
die we voor langebaan gebruiken (fetch-isu-skaters.py) heeft geen shorttrack.

Per schaatser zonder foto: zoek op Wikidata, neem alleen treffers met
"skat" in de omschrijving (geen naamgenoten) en gebruik hun hoofdfoto (P18).

Draaien: python3 -I scripts/fetch-shorttrack-photos.py
"""
import json, subprocess, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "RivalyDevSeed/1.0 (development data)"}
WD = "https://www.wikidata.org/w/api.php?"
SPORT = "shorttrack"


def get(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return json.load(r)
        except Exception:
            time.sleep(5 * (attempt + 1))
    return {}


def missing_names():
    out = subprocess.run(
        ["npx", "convex", "data", "athletes", "--limit", "5000", "--format", "jsonl"],
        capture_output=True, text=True, check=True,
    ).stdout
    rows = [json.loads(line) for line in out.splitlines() if line.strip()]
    return [
        r["name"] for r in rows
        if r.get("sport") == SPORT
        and not r.get("category", "").startswith("relay")
        and not r.get("imageUrl")
    ]


def photo(name):
    search = get(WD + urllib.parse.urlencode({
        "action": "wbsearchentities", "search": name, "language": "en", "limit": 7, "format": "json",
    })).get("search", [])
    ids = [h["id"] for h in search if "skat" in (h.get("description") or "").lower()]
    if not ids:
        return None

    entities = get(WD + urllib.parse.urlencode({
        "action": "wbgetentities", "ids": "|".join(ids), "props": "claims", "format": "json",
    })).get("entities", {})
    for entity_id in ids:
        claims = entities.get(entity_id, {}).get("claims", {})
        if "P18" in claims:
            file = claims["P18"][0]["mainsnak"]["datavalue"]["value"].replace(" ", "_")
            return f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(file)}?width=400"
    return None


def main():
    names = missing_names()
    images = []
    for name in names:
        url = photo(name)
        if url:
            images.append({"name": name, "imageUrl": url})
        print(f"{'✓' if url else '·'} {name}", file=sys.stderr, flush=True)
        time.sleep(1)

    if images:
        subprocess.run(
            ["npx", "convex", "run", "seedImages:setAthleteImages",
             json.dumps({"sport": SPORT, "images": images}, ensure_ascii=False)],
            check=True,
        )
    print(f"{len(images)} van {len(names)} aangevuld", file=sys.stderr)


main()
