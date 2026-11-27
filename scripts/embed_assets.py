"""Embed real game artwork in the static page; missing artwork never breaks the planner."""
import base64
import concurrent.futures
import json
import re
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "data/icon_sources.json").read_text(encoding="utf-8"))
data = json.loads((root / "data/schema300.json").read_text(encoding="utf-8"))
sources = manifest["sources"]
keys = sorted({f"img_CrystalResearch_New_Awakening{t['id'] - 1041}" if t["awake"] else t["pic"] for t in data})
def mime(b):
    if b.startswith(b"\x89PNG\r\n\x1a\n"): return "image/png"
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP": return "image/webp"
    if b.startswith(b"\xff\xd8\xff"): return "image/jpeg"
    return None

def load(key):
    try:
        # AssetStudio exports may append a signed Unity path ID.
        folder = root / "assets/icons"
        files = [p for p in folder.iterdir() if p.is_file() and (p.stem == key or re.fullmatch(re.escape(key) + r"_-?\d+", p.stem))]
        if files:
            payload = sorted(files)[0].read_bytes()
        elif key in sources:
            req = urllib.request.Request(sources[key], headers={"User-Agent": "Mozilla/5.0 (compatible; RoK crystal planner asset build)"})
            with urllib.request.urlopen(req, timeout=20) as res:
                payload = res.read(2_000_001)
        else:
            return key, None, "no original file/reference"
        media = mime(payload)
        if not media or len(payload) > 2_000_000:
            return key, None, "not a supported image or exceeds size cap"
        return key, "data:" + media + ";base64," + base64.b64encode(payload).decode("ascii"), ""
    except Exception as e:
        return key, None, str(e)

assets = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for key, encoded, err in pool.map(load, keys):
        if encoded:
            assets[key] = encoded
            print("EMBEDDED", key)
        else:
            print("FALLBACK", key, err)
required_local = set(manifest.get("local", {}))
missing_local = required_local - set(assets)
if missing_local:
    raise SystemExit("Required uploaded icons could not be embedded: " + ", ".join(sorted(missing_local)))
html = (root / "index.html").read_text(encoding="utf-8")
html, count = re.subn(r'(<script type="application/json" id="gameAssets">).*?(</script>)', lambda m: m[1]+json.dumps(assets,separators=(",",":"))+m[2], html, flags=re.S)
assert count == 1
out = root / "_site"
out.mkdir(exist_ok=True)
(out / "index.html").write_text(html, encoding="utf-8")
(out / ".nojekyll").touch()
cards = sum((f"img_CrystalResearch_New_Awakening{t['id'] - 1041}" if t["awake"] else t["pic"]) in assets for t in data)
(out / "asset-status.json").write_text(json.dumps({"embedded_images": len(assets), "covered_cards": cards, "total_cards": len(data), "missing": sorted(set(keys)-set(assets))}, indent=2), encoding="utf-8")
print(f"ICON COVERAGE: {cards}/{len(data)} cards, {len(assets)} unique images.")
