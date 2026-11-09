"""
Haalt het deelnemersveld voor schaatsen en shorttrack op van Wikipedia: alle
deelnemers aan de individuele onderdelen van de Spelen van 2026 en de podia
van de World Cups 2025/26. Schrijft fields.json; zet die om naar
convex/lib/skatingFields2026.ts.

Draaien: python3 -I scripts/fetch-skating-fields.py
"""
import json, re, time, urllib.parse, urllib.request

UA = {"User-Agent": "RivalyDevSeed/1.0 (development data)"}

def wikitext(title):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "parse", "format": "json", "prop": "wikitext", "formatversion": "2", "page": title, "redirects": "1"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r:
                time.sleep(1)
                return json.load(r)["parse"]["wikitext"]
        except Exception as e:
            time.sleep(10 * (attempt + 1))
    return ""

OLY = {
 "speedskating": ("Speed skating at the 2026 Winter Olympics – ", ["Men's 500 metres","Men's 1000 metres","Men's 1500 metres","Men's 5000 metres","Men's 10,000 metres","Men's mass start","Women's 500 metres","Women's 1000 metres","Women's 1500 metres","Women's 3000 metres","Women's 5000 metres","Women's mass start"]),
 "shorttrack": ("Short-track speed skating at the 2026 Winter Olympics – ", ["Men's 500 metres","Men's 1000 metres","Men's 1500 metres","Women's 500 metres","Women's 1000 metres","Women's 1500 metres"]),
}

ROW = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\][^\n{]*?\{\{\s*[Ff]lagIOC\s*\|\s*([A-Z]{3})")
MEDAL = re.compile(r"\{\{\s*flag(?:medalist|athlete|IOCathlete)\s*\|\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*\|\s*([A-Z]{3})")

athletes = {}  # (sport, name) -> {name, nation, category}

def add(sport, title, display, nation, category):
    name = (display or re.sub(r"\s*\(.*?\)$", "", title)).strip()
    if not name or nation in ("ROC",):
        return
    key = (sport, name, category)
    athletes.setdefault(key, {"sport": sport, "name": name, "nation": nation, "category": category, "wiki": title.strip()})

for sport, (prefix, events) in OLY.items():
    for event in events:
        w = wikitext(prefix + event)
        category = "men" if event.startswith("Men") else "women"
        # Alleen de uitslagen, niet de recordkaders bovenaan.
        start = w.find("==Results")
        if start < 0: start = w.find("== Results")
        body = w[start:] if start >= 0 else w
        n = 0
        for m in ROW.finditer(body):
            add(sport, m.group(1), m.group(2), m.group(3), category); n += 1
        print(sport, event, n)

# World Cup 2025/26 (langebaan): podia per wedstrijd, per sectie mannen/vrouwen.
for i in range(1, 7):
    w = wikitext(f"2025–26 ISU Speed Skating World Cup – World Cup {i}")
    if not w: continue
    category = None
    n = 0
    for line in w.split("\n"):
        h = re.match(r"^=+\s*(.*?)\s*=+\s*$", line)
        if h:
            t = h.group(1).lower()
            if "women" in t: category = "women"
            elif "men" in t: category = "men"
            elif "mixed" in t or "team" in t: category = None
            continue
        if category:
            for m in MEDAL.finditer(line):
                add("speedskating", m.group(1), m.group(2), m.group(3), category); n += 1
    print("WC", i, n)

rows = sorted(athletes.values(), key=lambda a: (a["sport"], a["category"], a["name"]))
json.dump(rows, open("fields.json", "w"), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter((a["sport"], a["category"]) for a in rows))
