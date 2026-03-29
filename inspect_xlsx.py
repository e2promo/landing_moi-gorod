import re
import zipfile
import xml.etree.ElementTree as ET


NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def col_to_num(ref):
    m = re.match(r"([A-Z]+)", ref)
    if not m:
        return 0
    s = m.group(1)
    n = 0
    for ch in s:
        n = n * 26 + (ord(ch) - ord("A") + 1)
    return n


def read_shared_strings(zf):
    try:
        root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    out = []
    for si in root.findall("a:si", NS):
        parts = []
        for t in si.findall(".//a:t", NS):
            parts.append(t.text or "")
        out.append("".join(parts))
    return out


def get_first_sheet_path(zf):
    wb = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    first = wb.find("a:sheets/a:sheet", NS)
    if first is None:
        raise RuntimeError("No sheets found in workbook")
    rid = first.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
    if not rid:
        raise RuntimeError("First sheet relation id not found")
    rel_map = {
        r.attrib["Id"]: r.attrib["Target"]
        for r in rels.findall("a:Relationship", {"a": "http://schemas.openxmlformats.org/package/2006/relationships"})
    }
    if rid not in rel_map:
        raise RuntimeError("Sheet relation target not found")
    target = rel_map[rid]
    if not target.startswith("xl/"):
        target = "xl/" + target
    return target


def read_rows(path):
    with zipfile.ZipFile(path) as zf:
        sst = read_shared_strings(zf)
        sheet_path = get_first_sheet_path(zf)
        root = ET.fromstring(zf.read(sheet_path))
        rows = []
        for row in root.findall(".//a:sheetData/a:row", NS):
            vals = {}
            for c in row.findall("a:c", NS):
                ref = c.attrib.get("r", "")
                col = col_to_num(ref)
                typ = c.attrib.get("t")
                v = c.find("a:v", NS)
                if v is None:
                    continue
                text = v.text or ""
                if typ == "s":
                    idx = int(text)
                    text = sst[idx] if idx < len(sst) else ""
                vals[col] = text
            if vals:
                max_col = max(vals)
                rows.append([vals.get(i, "") for i in range(1, max_col + 1)])
        return rows


if __name__ == "__main__":
    rows = read_rows("AP_Kyev.xlsx")
    print("rows", len(rows))
    for i, row in enumerate(rows[:25], 1):
        print(i, row)
