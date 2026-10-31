"""Build data.js and product images from the Hutbazar (Brismart) product API.

Usage: python tools/build_catalogue.py <products.json> <web_dir>
products.json comes from https://api.hutbazar.com.au/api/product?page=1&paginate=1000&status=1
"""
import io
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

src, web = Path(sys.argv[1]), Path(sys.argv[2])
img_dir = web / "assets" / "products"
img_dir.mkdir(parents=True, exist_ok=True)

# Hutbazar category slug -> unified category id
DEFAULT_CAT = {
    "beverage-bazar": "drinks", "fresh-vegetable": "veg", "ready-mix-spice-bazar": "curry",
    "fish-bazar-frozen": "fish", "fresh-produce-bazar": "pantry", "sweets-desserts-bazar": "sweets",
    "dried-fishes-shutki-bhorta-bazar": "shutki", "rice-dal-bazar": "rice", "spice-bazar": "spices",
    "frozen-bazar": "frozen", "snacks-bazar": "snacks", "meat-bazar": "meat",
    "cooking-essentials-bazar": "pantry", "pickles-sauce-bazar": "pickles", "oil-ghee-bazar": "oil",
    "household-bazar": "pitha",
}

# Per-product category overrides
OVERRIDE = {
    "essentials": [3214, 3200, 3086, 3219, 3142, 2896, 3158, 3157, 3091, 3090, 3089, 3088, 3087],
    "drinks": [3145, 3143, 2868, 2867, 3081],
    "frozen": [3032, 3028, 2914, 2916, 2915],
    "curry": [3121, 3116, 3114, 3141, 3120, 3118, 3117, 3115, 2951, 2947, 3119, 2885, 2884, 2889, 2883,
              3146, 3094, 3070, 2952, 2948, 2946, 2945, 2944, 2942, 2888, 2886, 3175],
    "shutki": [3007, 3006, 3005, 3004, 3003, 3098, 3211],
    "fish": [2997, 2992, 2991],
    "veg": [3164, 3126, 3036, 3097, 3132, 3039, 3035, 3034, 3054, 3043, 3042],
    "pitha": [3050, 3049, 3048, 3163, 3162, 3166, 3027, 3179, 3122, 3055, 3056],
    "snacks": [2897, 2900],
    "spices": [3059, 2905],
    "pantry": [3184],
}
CAT_OF = {pid: cat for cat, ids in OVERRIDE.items() for pid in ids}

# Unclear or test listings
SKIP = {3220, 2893, 2904, 2899}

UNIT_FIX = [
    (r"(\d)\s*LTR?\b", r"\1L"), (r"(\d)\s*LT\b", r"\1L"), (r"(\d)\s*ML\b", r"\1ml"),
    (r"(\d)\s*KG\b", r"\1kg"), (r"(\d)\s*G\b", r"\1g"), (r"\bPCS\b", "pcs"), (r"\bKG\b", "kg"),
]
TYPOS = {
    r"\bPrimium\b": "Premium", r"\bBiriyani\b": "Biryani", r"\bBriyani\b": "Biryani",
    r"\bKhicuri\b": "Khichuri", r"\bKichuri\b": "Khichuri", r"\bAginomoto\b": "Ajinomoto",
    r"\bTesting Salt\b": "Tasting Salt", r"\bTelapia\b": "Tilapia", r"\bHena\b": "Henna",
    r"\bBeen Seeds\b": "Bean Seeds", r"\bHydrabadi\b": "Hyderabadi", r"\bVortha\b": "Bhorta",
}
SMALL = {"and", "or", "of", "per", "with", "x"}
KEEP_UPPER = {"BBQ", "MSG", "B-B-Q", "B.B.Q"}


def bengali(text):
    return " ".join(re.findall(r"[ঀ-৿][ঀ-৿\s‌‍]*", text)).strip()


def clean_name(raw):
    s = re.sub(r"[ঀ-৿‌‍]+", " ", raw)   # drop Bengali script
    s = re.sub(r"\(\s*\)|-\s*$|\s+-\s+(?=\s*$)", " ", s)
    s = re.sub(r"\(\s*\)", " ", s)
    s = re.sub(r"\s+", " ", s).strip(" -")
    words = []
    for i, w in enumerate(s.split(" ")):
        if w.upper() in KEEP_UPPER:
            words.append(w.upper())
        elif i and w.lower() in SMALL:
            words.append(w.lower())
        else:
            words.append("-".join(p[:1].upper() + p[1:].lower() for p in w.split("-")))
    s = " ".join(words)
    for pat, rep in UNIT_FIX:
        s = re.sub(pat, rep, s, flags=re.I)
    s = re.sub(r"(\w)\(", r"\1 (", s)
    s = re.sub(r"\(\s*", "(", s)
    s = re.sub(r"\s*\)", ")", s)
    s = re.sub(r"\(([a-z])", lambda m: "(" + m.group(1).upper(), s)
    s = re.sub(r"b[-.]b[-.]q", "BBQ", s, flags=re.I)
    s = re.sub(r"\bbar-BBQ\b", "BBQ", s, flags=re.I)
    for typo, fix in TYPOS.items():
        s = re.sub(typo, fix, s, flags=re.I)
    return s.strip()


def size_of(name):
    m = re.search(r"(\d+(?:\.\d+)?\s?(?:kg|g|L|ml)\b|\d+\s?pcs|x\s?\d+s?)", name, re.I)
    return m.group(1) if m else "each"


def fetch(p):
    url = p["product_thumbnail"]["original_url"]
    out = img_dir / f"{p['id']}.jpg"
    if out.exists():
        return True
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BrismartPrototype/1.0",
            "Referer": "https://www.hutbazar.com.au/"})
        data = urllib.request.urlopen(req, timeout=30).read()
        im = Image.open(io.BytesIO(data))
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
        im.thumbnail((360, 360), Image.LANCZOS)
        canvas = Image.new("RGB", (360, 360), (255, 255, 255))
        canvas.paste(im, ((360 - im.width) // 2, (360 - im.height) // 2))
        canvas.save(out, "JPEG", quality=80, optimize=True, progressive=True)
        return True
    except Exception as e:  # noqa: BLE001
        print("image failed", p["id"], url, e)
        return False


products = json.loads(src.read_text(encoding="utf-8"))["data"]
keep = [p for p in products if p["id"] not in SKIP and p.get("product_thumbnail") and p["categories"]]
with ThreadPoolExecutor(12) as pool:
    ok = list(pool.map(fetch, keep))

rows = []
for p, good in zip(keep, ok):
    if not good:
        continue
    cat = CAT_OF.get(p["id"]) or DEFAULT_CAT[p["categories"][0]["slug"]]
    name = clean_name(p["name"])
    row = {"id": p["id"], "cat": cat, "name": name, "size": size_of(name),
           "price": round(float(p["sale_price"] or p["price"]), 2), "img": f"assets/products/{p['id']}.jpg"}
    if float(p["price"]) > float(p["sale_price"] or p["price"]):
        row["was"] = round(float(p["price"]), 2)
    bn = bengali(p["name"])
    if bn:
        row["bn"] = bn
    if p.get("brand"):
        row["brand"] = p["brand"]["name"]
    rows.append(row)

rows.sort(key=lambda r: r["id"], reverse=True)
lines = ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in rows)
(web / "products.js").write_text(
    "// Generated by tools/build_catalogue.py from the Hutbazar (Brismart) catalogue. Do not edit by hand.\n"
    f"const HB_PRODUCTS = [\n{lines}\n];\n", encoding="utf-8")
print("products", len(rows))
