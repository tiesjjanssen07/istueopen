# downloads building outlines and the walkways between buildings from openstreetmap
# writes data/buildings.json and data/walkways.json (used by the campus map and the walkways list)
import json, math, os, re, time, urllib.parse, urllib.request

BBOX = "51.4425,5.4790,51.4545,5.5010"
SERVERS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter",
           "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.kumi.systems/api/interpreter"] * 2


def overpass(q):
    for i, server in enumerate(SERVERS):
        if i:
            time.sleep(30)
        try:
            req = urllib.request.Request(server, data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "istueopen.nl"})
            return json.load(urllib.request.urlopen(req, timeout=120))
        except Exception as e:
            print("failed:", server, e)
    raise SystemExit("no server answered")


def rings_of(e):
    rings = []
    if e["type"] == "way" and e.get("geometry"):
        rings.append(e["geometry"])
    if e["type"] == "relation":
        rings += [m["geometry"] for m in e.get("members", []) if m.get("role") == "outer" and m.get("geometry")]
    return [[[round(p["lat"], 6), round(p["lon"], 6)] for p in r] for r in rings]


# --- buildings: all named buildings, plus anything named like a place in js/hours.js (some aren't tagged as a building)
src = open("js/hours.js").read()
names = set(re.findall(r'name: "([^"]+)"', src)) | set(re.findall(r'osm: "([^"]+)"', src))
esc = lambda x: "".join("\\\\" + c if c in ".^$*+?()[]{}|\\" else c for c in x.replace('"', ""))
rx = "^(" + "|".join(esc(x) for x in sorted(names)) + ")$"
q = ('[out:json][timeout:90];(way["building"]["name"](%s);relation["building"]["name"](%s);'
     'way["name"~"%s",i](%s);relation["name"~"%s",i](%s););out geom;') % (BBOX, BBOX, rx, BBOX, rx, BBOX)
buildings, seen = [], set()
for e in overpass(q).get("elements", []):
    name = (e.get("tags") or {}).get("name")
    rings = [r for r in rings_of(e) if len(r) > 3 and r[0] == r[-1]]  # only closed shapes, not roads or paths
    if name and rings and name not in seen:
        seen.add(name)
        buildings.append({"name": name, "rings": rings})
if len(buildings) < 10:
    raise SystemExit("too few buildings (%d), keeping the old files" % len(buildings))
buildings.sort(key=lambda b: b["name"])

# --- walkways: bridges and corridors on the first floor that touch two different buildings
q = ('[out:json][timeout:90];('
     'way["building"="bridge"](%(b)s);way["building:part"="bridge"](%(b)s);way["man_made"="bridge"](%(b)s);'
     'way["highway"]["bridge"](%(b)s);way["highway"="corridor"](%(b)s);way["indoor"="corridor"](%(b)s);'
     ');out geom tags;') % {"b": BBOX}
cands = overpass(q).get("elements", [])
print(len(cands), "possible walkways")

LAT0 = 51.448
def xy(p):
    return ((p[1] - 5.49) * 111320 * math.cos(math.radians(LAT0)), (p[0] - LAT0) * 110540)

def seg_dist(p, a, b):
    (px, py), (ax, ay), (bx, by) = xy(p), xy(a), xy(b)
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)

def inside(p, ring):
    x, y = xy(p); c = False
    pts = [xy(q) for q in ring]
    for i in range(len(pts) - 1):
        (x1, y1), (x2, y2) = pts[i], pts[i + 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c

def dist_to_building(p, b):
    if any(inside(p, r) for r in b["rings"]):
        return 0
    return min(seg_dist(p, r[i], r[i + 1]) for r in b["rings"] for i in range(len(r) - 1))

def near(p, limit=6):
    best = None
    for b in buildings:
        d = dist_to_building(p, b)
        if d <= limit and (best is None or d < best[0]):
            best = (d, b["name"])
    return best and best[1]

walkways, pairs = [], set()
for e in cands:
    g = [[round(p["lat"], 6), round(p["lon"], 6)] for p in e.get("geometry", [])]
    if len(g) < 2:
        continue
    tags = e.get("tags") or {}
    closed = g[0] == g[-1] and len(g) > 3
    if closed:
        # an area: which buildings does its outline touch?
        touched = []
        for p in g:
            n = near(p, 3)
            if n and n not in touched:
                touched.append(n)
        ends = touched[:2] if len(touched) == 2 else None
    else:
        a, b = near(g[0]), near(g[-1])
        ends = [a, b] if a and b and a != b else None
    print("-", e["type"], e["id"], {k: tags[k] for k in tags if k in ("name", "highway", "bridge", "building", "building:part", "man_made", "layer", "level", "indoor", "covered")}, "->", ends)
    if not ends:
        continue
    key = tuple(sorted(ends))
    if key in pairs:
        continue
    pairs.add(key)
    walkways.append({"a": key[0], "b": key[1], "line": g})
walkways.sort(key=lambda w: (w["a"], w["b"]))
print(len(walkways), "walkways:", ", ".join(w["a"] + " - " + w["b"] for w in walkways))

os.makedirs("data", exist_ok=True)
with open("data/buildings.json", "w") as f:
    json.dump(buildings, f, separators=(",", ":"))
with open("data/walkways.json", "w") as f:
    json.dump(walkways, f, separators=(",", ":"))
print(len(buildings), "buildings")
