import json
import re
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path


API_KEY = "c8356958-fe16-4a92-a1fa-0fe4f98c42cd"
SRC = Path("AP_Kyev_dump_utf8.txt")
OUT = Path("donetsk_kyev_addresses.json")


def norm_address(s):
    s = s.replace("\xa0", " ").strip()
    s = re.sub(r"\s+", " ", s)
    s = s.replace("д.", "д.")
    return s


def parse_rows():
    lines = SRC.read_text(encoding="utf-8").splitlines()
    rows = []
    for line in lines:
        if "\\t" not in line:
            continue
        parts = line.split("\\t")
        if len(parts) < 4:
            continue
        if not parts[0].strip().isdigit():
            continue
        addr = norm_address(parts[1])
        rows.append((int(parts[0]), addr, parts[2].strip(), parts[3].strip()))
    return rows


def geocode(addr):
    q = urllib.parse.urlencode(
        {
            "apikey": API_KEY,
            "format": "json",
            "geocode": f"Донецк, {addr}",
            "results": "10",
            "bbox": "37.50,47.90~38.15,48.15",
            "rspn": "1",
        }
    )
    url = f"https://geocode-maps.yandex.ru/1.x/?{q}"
    with urllib.request.urlopen(url, timeout=20) as r:
        payload = json.load(r)
    candidates = payload["response"]["GeoObjectCollection"]["featureMember"]
    if not candidates:
        return None

    def score(c):
        obj = c["GeoObject"]
        txt = obj["metaDataProperty"]["GeocoderMetaData"].get("text", "").lower().replace("ё", "е")
        s = 0
        if "донецк" in txt:
            s += 10
        if "макеев" in txt or "ясинов" in txt or "харцыз" in txt:
            s -= 30
        raw = addr.lower().replace("ё", "е")
        for token in re.findall(r"[а-яa-z0-9]+", raw):
            if token in {"ул", "д", "пр", "б", "а"}:
                continue
            if token in txt:
                s += 2
        meta = obj["metaDataProperty"]["GeocoderMetaData"]
        if meta.get("precision") in {"exact", "number"}:
            s += 8
        if meta.get("kind") == "house":
            s += 6
        return s

    best = max(candidates, key=score)
    obj = best["GeoObject"]
    pos = obj["Point"]["pos"].split()
    lon, lat = map(float, pos)
    meta = obj["metaDataProperty"]["GeocoderMetaData"]
    return {
        "coords": [lat, lon],
        "resolvedAddress": meta.get("text", ""),
        "precision": meta.get("precision", ""),
        "kind": meta.get("kind", ""),
    }


def main():
    rows = parse_rows()
    unique_rows = {}
    for _, addr, entrance, floors in rows:
        key = (addr, entrance)
        if key not in unique_rows:
            unique_rows[key] = floors
    grouped = Counter(addr for addr, _ in unique_rows.keys())
    out = []
    idx = 1
    for addr, cnt in grouped.items():
        g = geocode(addr)
        if g is None:
            g = {
                "coords": [48.0159, 37.8029],
                "resolvedAddress": "Донецк, адрес уточняется",
                "precision": "",
                "kind": "",
            }
        out.append(
            {
                "id": idx,
                "address": addr,
                "lifts": cnt,
                "coords": g["coords"],
                "resolvedAddress": g["resolvedAddress"],
                "manualReview": not (g["precision"] in {"exact", "number"} and g["kind"] == "house"),
            }
        )
        idx += 1

    OUT.write_text(json.dumps({"rows": len(rows), "unique": len(out), "addresses": out}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        "rows",
        len(rows),
        "dedup_rows",
        len(unique_rows),
        "unique_addresses",
        len(out),
        "sum_lifts",
        sum(x["lifts"] for x in out),
    )


if __name__ == "__main__":
    main()
