import json
import re
from pathlib import Path


MAP_FILE = Path("map-data.js")
DONETSK_FILE = Path("donetsk_kyev_addresses.json")


ROW_RE = re.compile(
    r"\{\s*id:\s*(\d+),\s*address:\s*'([^']+)',\s*coords:\s*\[\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\],\s*lifts:\s*(\d+)(?:,\s*resolvedAddress:\s*'([^']*)')?(?:,\s*manualReview:\s*true,\s*reviewReason:\s*'([^']*)')?\s*}\s*,?",
    re.S,
)


def parse_makeevka(text):
    start = text.find("makeevka: [")
    end = text.find("\n    ]\n};", start)
    if start == -1 or end == -1:
        raise RuntimeError("makeevka block not found")
    block = text[start:end]
    rows = []
    for m in ROW_RE.findall(block):
        rows.append(
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
    return rows


def row_to_js(row):
    parts = [
        f"id: {row['id']}",
        f"address: '{row['address']}'",
        f"coords: [{row['coords'][0]:.6f}, {row['coords'][1]:.6f}]",
        f"lifts: {row['lifts']}",
    ]
    if row.get("resolvedAddress"):
        parts.append(f"resolvedAddress: '{row['resolvedAddress'].replace("'", '')}'")
    if row.get("manualReview"):
        parts.append("manualReview: true")
        reason = row.get("reviewReason") or "требует ручной проверки"
        parts.append(f"reviewReason: '{reason}'")
    return "{ " + ", ".join(parts) + " }"


def main():
    current = MAP_FILE.read_text(encoding="utf-8")
    makeevka_rows = parse_makeevka(current)

    donetsk_json = json.loads(DONETSK_FILE.read_text(encoding="utf-8"))
    donetsk_rows = []
    for item in donetsk_json["addresses"]:
        donetsk_rows.append(
            {
                "id": item["id"],
                "address": item["address"],
                "coords": item["coords"],
                "lifts": item["lifts"],
                "resolvedAddress": item.get("resolvedAddress", ""),
                "manualReview": bool(item.get("manualReview", False)),
                "reviewReason": "требует ручной проверки геокодинга" if item.get("manualReview") else "",
            }
        )

    lines = []
    lines.append("// Address data for Donetsk and Makeevka")
    lines.append("// Donetsk addresses imported from AP_Kyev.xlsx")
    lines.append("// manualReview/reviewReason mark rows for manual verification")
    lines.append("")
    lines.append("const addressData = {")
    lines.append("    donetsk: [")
    for i, row in enumerate(donetsk_rows):
        suffix = "," if i < len(donetsk_rows) - 1 else ""
        lines.append("        " + row_to_js(row) + suffix)
    lines.append("    ],")
    lines.append("    makeevka: [")
    for i, row in enumerate(makeevka_rows):
        suffix = "," if i < len(makeevka_rows) - 1 else ""
        lines.append("        " + row_to_js(row) + suffix)
    lines.append("    ]")
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
    lines.append("")

    MAP_FILE.write_text("\n".join(lines), encoding="utf-8")
    print("Updated map-data.js with imported Donetsk addresses")


if __name__ == "__main__":
    main()
