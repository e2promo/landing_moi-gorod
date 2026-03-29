import json
import math
import re
import urllib.parse
import urllib.request
from pathlib import Path


API_KEY = "c8356958-fe16-4a92-a1fa-0fe4f98c42cd"


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p = math.pi / 180
    d_lat = (lat2 - lat1) * p
    d_lon = (lon2 - lon1) * p
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin(d_lon / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(a))


def load_data():
    text = Path("map-data.js").read_text(encoding="utf-8")
    start_d = text.find("donetsk: [")
    start_m = text.find("makeevka: [")
    if start_d == -1 or start_m == -1:
        raise RuntimeError("city blocks not found")

    end_d = text.rfind("],", start_d, start_m)
    end_m = text.find("\n    ]\n};", start_m)
    if end_d == -1 or end_m == -1:
        raise RuntimeError("city block boundaries not found")

    city_blocks = {
        "donetsk": text[start_d:end_d],
        "makeevka": text[start_m:end_m],
    }

    data = {"donetsk": [], "makeevka": []}
    row_re = re.compile(
        r"\{\s*id:\s*(\d+),\s*address:\s*'([^']+)',\s*coords:\s*\[\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\],\s*lifts:\s*(\d+)\s*\}"
    )
    for city, block in city_blocks.items():
        for item in row_re.findall(block):
            data[city].append(
                {
                    "id": int(item[0]),
                    "address": item[1],
                    "coords": [float(item[2]), float(item[3])],
                    "lifts": int(item[4]),
                }
            )
    return data


def geocode(address, city):
    query = urllib.parse.quote(f"{address}, {city}")
    url = (
        "https://geocode-maps.yandex.ru/1.x/"
        f"?apikey={API_KEY}&format=json&geocode={query}"
    )
    with urllib.request.urlopen(url, timeout=15) as response:
        payload = json.load(response)
    features = payload["response"]["GeoObjectCollection"]["featureMember"]
    if not features:
        return None
    pos = features[0]["GeoObject"]["Point"]["pos"].split()
    lon, lat = map(float, pos)
    return lat, lon


def main():
    data = load_data()
    city_names = {"donetsk": "Донецк", "makeevka": "Макеевка"}

    for city_key in ["donetsk", "makeevka"]:
        print(f"\n{city_key.upper()}")
        mismatches = 0
        checked = 0
        for item in data[city_key]:
            checked += 1
            g = geocode(item["address"], city_names[city_key])
            if not g:
                print(f"- {item['address']}: no geocode result")
                continue
            d = haversine_km(item["coords"][0], item["coords"][1], g[0], g[1])
            marker = "OK"
            if d > 0.8:
                marker = "MISMATCH"
                mismatches += 1
            print(
                f"- {marker}: {item['address']} | delta={d:.2f} km | "
                f"stored=[{item['coords'][0]:.6f}, {item['coords'][1]:.6f}] | "
                f"geo=[{g[0]:.6f}, {g[1]:.6f}]"
            )
        print(f"Checked: {checked}, mismatches (>0.8km): {mismatches}")


if __name__ == "__main__":
    main()
