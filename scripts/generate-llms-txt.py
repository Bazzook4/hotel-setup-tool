#!/usr/bin/env python3
"""Regenerate src/public/llms.txt from sitemap.xml + each page's own title/description.

Run after publishing new guides:  python3 scripts/generate-llms-txt.py
Reads only what is already in the sitemap, so it can never list a noindex page.
"""
import re, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src" / "public"
BASE = "https://www.onlinehotelier.com"

def path_for(url):
    p = url.replace(BASE, "") or "/"
    c = ROOT / (p.lstrip("/") + ("index.html" if p.endswith("/") else ""))
    if c.is_file(): return c
    c2 = ROOT / p.lstrip("/")
    return c2 if c2.is_file() else None

def meta(f):
    s = f.read_text(encoding="utf-8", errors="ignore")[:9000]
    t = re.search(r"<title>(.*?)</title>", s, re.S)
    d = re.search(r'name="description"\s+content="(.*?)"', s, re.S)
    t = html.unescape(re.sub(r"\s+", " ", t.group(1))).strip() if t else ""
    d = html.unescape(re.sub(r"\s+", " ", d.group(1))).strip() if d else ""
    return re.sub(r"\s*\|\s*OnlineHotelier$", "", t), d

CATS = [
 ("Start Here",         lambda p: p in ("/", "/guides/", "/tools/", "/services/", "/about/")),
 ("OTA Guides",         lambda p: p.startswith("/guides/ota/")),
 ("Revenue Management", lambda p: p.startswith("/guides/revenue/")),
 ("Hotel Software",     lambda p: p.startswith("/guides/software/")),
 ("Reports",            lambda p: p.startswith("/guides/reports/")),
 ("Operations",         lambda p: p.startswith("/guides/operations/")),
 ("Compliance & Tax",   lambda p: p.startswith("/guides/compliance/")),
 ("Free Tools",         lambda p: p.startswith("/tools/")),
 ("Services",           lambda p: p.startswith("/services/")),
]

urls = re.findall(r"<loc>([^<]+)</loc>", (ROOT/"sitemap.xml").read_text(encoding="utf-8"))
rows = []
for u in urls:
    f = path_for(u)
    if not f: continue
    t, d = meta(f)
    if t: rows.append((u.replace(BASE, "") or "/", t, d))

out = ["# OnlineHotelier", "",
 "> Practical guides, calculators and services for Indian hotel owners and "
 "managers: OTA distribution, revenue management, compliance and daily "
 "operations. All figures are in Indian rupees and reflect Indian market "
 "conditions.", "",
 "OnlineHotelier helps independent and small-chain hotels in India get more "
 "direct bookings and depend less on OTA commission. Guides cover the major "
 "Indian channels (MakeMyTrip, Goibibo, Booking.com, Agoda, Airbnb) and "
 "Indian regulation (GST, TDS/TCS, Form C).", ""]

used = set()
for name, pred in CATS:
    sel = [r for r in rows if pred(r[0]) and r[0] not in used]
    if not sel: continue
    used.update(r[0] for r in sel)
    out += [f"## {name}", ""]
    out += [f"- [{t}]({BASE}{p})" + (f": {d}" if d else "") for p, t, d in sorted(sel)]
    out.append("")

rest = [r for r in rows if r[0] not in used]
if rest:
    out += ["## Other Pages", ""]
    out += [f"- [{t}]({BASE}{p})" + (f": {d}" if d else "") for p, t, d in sorted(rest)]
    out.append("")

(ROOT/"llms.txt").write_text("\n".join(out), encoding="utf-8")
print(f"llms.txt: {len(rows)} pages from {len(urls)} sitemap URLs")
