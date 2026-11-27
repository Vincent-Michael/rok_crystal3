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
