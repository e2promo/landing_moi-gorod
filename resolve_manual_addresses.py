import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path


API_KEY = "c8356958-fe16-4a92-a1fa-0fe4f98c42cd"
MAP_FILE = Path("map-data.js")
REPORT_FILE = Path("map-manual-resolution.txt")

CITY_CFG = {
    "donetsk": {
        "label": "Донецк",
        "center": (48.0159, 37.8029),
        "bbox": (37.50, 47.90, 38.15, 48.15),
    },
    "makeevka": {
        "label": "Макеевка",
        "center": (48.0459, 37.9629),
        "bbox": (37.82, 47.95, 38.20, 48.18),
    },
}

FORBIDDEN_LOCALITIES = {
    "donetsk": ["макеевка", "ясиноват", "харцызск"],
    "makeevka": ["донецк", "ясиноват", "харцызск"],
}


def normalize(s):
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[^\w\s]", " ", s, flags=re.U)
    return re.sub(r"\s+", " ", s).strip()


def split_address(address):
    parts = [p.strip() for p in address.split(",")]
    street = parts[0] if parts else address
    num_src = parts[1] if len(parts) > 1 else ""
    num = re.search(r"(\d+[а-яa-z]?)", num_src.lower())
    house = num.group(1) if num else ""
    return street, house


def street_tokens(street):
    stop = {"ул", "улица", "пр", "проспект", "бул", "бульвар", "пер", "переулок"}
    return [t for t in normalize(street).split() if t not in stop]


def parse_data(text):
    blocks = {}
    d_start = text.find("donetsk: [")
    m_start = text.find("makeevka: [")
    if d_start == -1 or m_start == -1:
        raise RuntimeError("city blocks not found")
    d_end = text.rfind("],", d_start, m_start)
    m_end = text.find("\n    ]\n};", m_start)
    blocks["donetsk"] = text[d_start:d_end]
    blocks["makeevka"] = text[m_start:m_end]

    row_re = re.compile(
        r"\{\s*id:\s*(\d+),\s*address:\s*'([^']+)',\s*coords:\s*\[\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\],\s*lifts:\s*(\d+)(?:,\s*resolvedAddress:\s*'([^']*)')?(?:,\s*manualReview:\s*true,\s*reviewReason:\s*'([^']*)')?\s*}\s*,?"
    )

    out = {"donetsk": [], "makeevka": []}
    for city in ("donetsk", "makeevka"):
        for m in row_re.findall(blocks[city]):
            out[city].append(
                {
                    "id": int(m[0]),
                    "address": m[1],
                    "coords": [float(m[2]), float(m[3])],
                    "lifts": int(m[4]),
                    "resolvedAddress": m[5] or "",
                    "manualReview": bool(m[6]),
                    "reviewReason": m[6] or "",
                }
            )
    return out


def geocode(query, cfg, results=20):
    min_lon, min_lat, max_lon, max_lat = cfg["bbox"]
    params = {
        "apikey": API_KEY,
        "format": "json",
        "geocode": query,
        "results": str(results),
        "bbox": f"{min_lon},{min_lat}~{max_lon},{max_lat}",
        "rspn": "1",
    }
    url = "https://geocode-maps.yandex.ru/1.x/?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=20) as r:
        payload = json.load(r)
    rows = payload["response"]["GeoObjectCollection"]["featureMember"]
    out = []
    for row in rows:
        obj = row["GeoObject"]
        meta = obj["metaDataProperty"]["GeocoderMetaData"]
        text = meta.get("text", "")
        pos = obj["Point"]["pos"].split()
        lon, lat = map(float, pos)
        out.append(
            {
                "text": text,
                "lat": lat,
                "lon": lon,
                "precision": meta.get("precision", ""),
                "kind": meta.get("kind", ""),
            }
        )
    return out


def score_candidate(cand, city_label, st_tokens, house):
    txt = normalize(cand["text"])
    score = 0

    if normalize(city_label) in txt:
        score += 10

    overlap = sum(1 for t in st_tokens if t in txt)
    score += overlap * 5

    if house and re.search(rf"\b{re.escape(house)}\b", txt):
        score += 25

    if cand["precision"] in {"exact", "number"}:
        score += 10
    elif cand["precision"] == "near":
        score += 4
    elif cand["precision"] == "street":
        score += 2

    if cand["kind"] == "house":
        score += 8
    elif cand["kind"] == "street":
        score += 2

    bad = ["аэропорт", "вокзал", "станция", "платформа", "терминал"]
    if any(b in txt for b in bad):
        score -= 100

    return score


def candidate_city_ok(cand_text, city_key):
    txt = normalize(cand_text)
    city_label = normalize(CITY_CFG[city_key]["label"])
    if city_label not in txt:
        return False
    for bad in FORBIDDEN_LOCALITIES[city_key]:
        if bad in txt:
            return False
    return True


def query_variants(address, city_label):
    street, _ = split_address(address)
    variants = [
        f"{city_label}, {address}",
        f"{address}, {city_label}",
        f"{city_label}, {street}",
    ]
    variants.append(variants[0].replace("пр.", "проспект").replace("ул.", "улица").replace("бул.", "бульвар"))
    return list(dict.fromkeys(variants))


def resolve_one(item, city_key, cfg):
    st, house = split_address(item["address"])
    st_tokens = street_tokens(st)
    best = None

    for q in query_variants(item["address"], cfg["label"]):
        for cand in geocode(q, cfg):
            if not candidate_city_ok(cand["text"], city_key):
                continue
            s = score_candidate(cand, cfg["label"], st_tokens, house)
            row = {**cand, "score": s, "query": q}
            if not best or row["score"] > best["score"]:
                best = row
        time.sleep(0.08)

    if not best:
        return None, "не найдено"

    txt = normalize(best["text"])
    house_ok = bool(house and re.search(rf"\b{re.escape(house)}\b", txt))
    street_ok = all(t in txt for t in st_tokens) if st_tokens else False

    if house_ok and street_ok and best["score"] >= 40:
        return best, "exact"
    if street_ok and best["score"] >= 24:
        return best, "street_only"
    return best, "low_confidence"


def build_js(data):
    lines = []
    lines.append("// Address data for Donetsk and Makeevka")
    lines.append("// Coordinates validated via Yandex Geocoder within city bounds")
    lines.append("// manualReview/reviewReason mark rows that still need manual verification")
    lines.append("")
    lines.append("const addressData = {")
    for city in ("donetsk", "makeevka"):
        lines.append(f"    {city}: [")
        arr = data[city]
        for i, it in enumerate(arr):
            parts = [
                f"id: {it['id']}",
                f"address: '{it['address']}'",
                f"coords: [{it['coords'][0]:.6f}, {it['coords'][1]:.6f}]",
                f"lifts: {it['lifts']}",
            ]
            if it.get("resolvedAddress"):
                parts.append(f"resolvedAddress: '{it['resolvedAddress'].replace("'", '')}'")
            if it.get("manualReview"):
                parts.append("manualReview: true")
                parts.append(f"reviewReason: '{it['reviewReason']}'")
            suffix = "," if i < len(arr) - 1 else ""
            lines.append("        { " + ", ".join(parts) + " }" + suffix)
        lines.append("    ]," if city == "donetsk" else "    ]")
    lines.append("};")
    lines.append("")
    lines.append("// Address program configuration")
    lines.append("const addressPrograms = {")
    lines.append("    donetsk: {")
    lines.append("        count: 100,")
    lines.append("        // First 35 addresses from the list above represent the program")
    lines.append("        addresses: addressData.donetsk.slice(0, 35)")
    lines.append("    },")
    lines.append("    makeevka: {")
    lines.append("        count: 81,")
    lines.append("        // First 27 addresses from the list above represent the program")
    lines.append("        addresses: addressData.makeevka.slice(0, 27)")
    lines.append("    }")
    lines.append("};")
    return "\n".join(lines) + "\n"


def main():
    text = MAP_FILE.read_text(encoding="utf-8")
    data = parse_data(text)
    report = ["Manual resolution run", ""]

    for city in ("donetsk", "makeevka"):
        cfg = CITY_CFG[city]
        report.append(f"[{city}]")
        unresolved = 0
        resolved = 0
        for item in data[city]:
            best, status = resolve_one(item, city, cfg)
            if not best:
                unresolved += 1
                item["coords"] = [cfg["center"][0], cfg["center"][1]]
                item["resolvedAddress"] = f"{cfg['label']}, адрес уточняется (центр города)"
                item["manualReview"] = True
                item["reviewReason"] = "не удалось сопоставить адрес"
                report.append(f"- id {item['id']} {item['address']}: unresolved")
                continue

            item["coords"] = [best["lat"], best["lon"]]
            item["resolvedAddress"] = best["text"]

            if status == "exact":
                item["manualReview"] = False
                item["reviewReason"] = ""
                resolved += 1
            elif status == "street_only":
                item["manualReview"] = True
                item["reviewReason"] = "подтверждена улица, номер дома требует проверки"
                unresolved += 1
            else:
                item["manualReview"] = True
                item["reviewReason"] = "низкая уверенность геокодера"
                unresolved += 1

            report.append(
                f"- id {item['id']} {item['address']}: {status} -> [{best['lat']:.6f}, {best['lon']:.6f}] | {best['text']}"
            )

        report.append(f"resolved exact: {resolved}")
        report.append(f"still manual: {unresolved}")
        report.append("")

    MAP_FILE.write_text(build_js(data), encoding="utf-8")
    REPORT_FILE.write_text("\n".join(report) + "\n", encoding="utf-8")
    print("Updated map-data.js")
    print("Saved map-manual-resolution.txt")


if __name__ == "__main__":
    main()
