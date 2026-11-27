import json
import re
from pathlib import Path
html = Path("index.html").read_text(encoding="utf-8")
data = json.loads(re.search(r'<script type="application/json" id="dataset">(.*?)</script>', html, re.S).group(1))
assert len(data) == 45
assert len({t["id"] for t in data}) == 45
rows = [r for t in data for r in t["rows"]]
assert len(rows) == 421
assert sum(r["cost"] for r in rows) == 150600900
assert sum(r["coin"] for r in rows) == 500000
assert sum(t["awake"] for t in data) == 4
assert all(r["level"] == i for t in data for i, r in enumerate(t["rows"], 1))
assert all(r["cost"] == 0 and r["seconds"] == 0 for t in data if t["awake"] for r in t["rows"])
script = re.findall(r'<script>(.*?)</script>', html, re.S)[-1]
Path("/tmp/crystal-site.js").write_text(script, encoding="utf-8")
print("Schema 300 integrity check passed: 45 technologies, 421 levels, 150,600,900 crystals, 500,000 KvK coins.")

manifest = json.loads(Path("data/icon_sources.json").read_text(encoding="utf-8"))
for key, path in manifest.get("local", {}).items():
    p = Path(path)
    assert p.stem == key and p.is_file(), f"Missing required local icon: {key}"
    assert p.read_bytes().startswith(b"\x89PNG\r\n\x1a\n"), f"Invalid PNG: {p}"
print("Required original local PNG files verified.")

sections = json.loads(re.search(r'const sections=(\[.*?\]);\s*const full=', html, re.S).group(1))
assert len(sections) == 5
ids = [i for s in sections for i in s["ids"]]
assert sorted(ids) == sorted(t["id"] for t in data)
totals = {t["id"]: sum(r["cost"] for r in t["rows"]) for t in data}
running = 0
for s in sections:
    assert s["base"] == sum(totals[i] for i in s["ids"])
    running += s["base"]
    assert s["cumulative"] == running
assert running == 150600900
print("Section costs verified:", [s["base"] for s in sections])

assert all(t.get("description") and t.get("descriptionKey") and t.get("buffLabels") for t in data)
print("Technology descriptions verified: 45/45")

from html.parser import HTMLParser
class PageIDs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
    def handle_starttag(self, tag, attrs):
        self.ids += [value for key, value in attrs if key == "id"]
page = PageIDs()
page.feed(html)
assert len(page.ids) == len(set(page.ids)), "Duplicate page IDs"
assert set(re.findall(r'\$\("([^"]+)"\)', script)) <= set(page.ids), "Missing JS element IDs"
assert '<dialog id="techDialog"' in html
print("Compact layout verified: unique HTML IDs, all JS references present, technology dialog.")

building = json.loads(re.search(r'<script type="application/json" id="buildingDataset">(.*?)</script>', html, re.S).group(1))
assert building == json.loads(Path("data/buildings122.json").read_text(encoding="utf-8"))
assert building["schema"] == 122
for kind, seconds in [("mine", 1214599), ("center", 3644604)]:
    entries = building[kind]
    assert [r["level"] for r in entries] == list(range(1, 26))
    assert sum(r["crystals"] for r in entries) == 1800000
    assert sum(r["seconds"] for r in entries) == seconds
    assert sum(r["crystals"] for r in entries[:20]) == 770000
print("Building schema 122 verified: 50 levels, both buildings 1,800,000 crystals each.")

assert sorted((t["id"], r["level"]) for t in data for r in t["rows"] if r["relation"] == 1) == [(1011, 1), (1011, 5), (1011, 8), (1011, 10), (1014, 8)]
assert all(r["relation"] in (0, 1) for r in rows)
print("Dependency relation audit: 416 AND/default rows, 5 OR rows.")
