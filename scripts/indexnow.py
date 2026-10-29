#!/usr/bin/env python3
"""Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver). Google does not use IndexNow.

Run after a deploy is confirmed live (see memory/deploy-pipeline.md):
  python3 scripts/indexnow.py --changed HEAD~1   # pages changed since a git ref
  python3 scripts/indexnow.py /guides/ota/makemytrip-commission.html
  python3 scripts/indexnow.py --sitemap          # every URL in sitemap.xml
  add --dry-run to print the list without sending

Only URLs listed in sitemap.xml are ever sent, so admin, samples and noindex
pages cannot leak out. The key file must be live at the web root first.
"""
import json, re, subprocess, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / "src" / "public"
HOST = "www.onlinehotelier.com"
BASE = "https://" + HOST
KEY = "72b2f2e174ab49fb866a9cf36f86a3f1"
ENDPOINT = "https://api.indexnow.org/indexnow"

def sitemap_urls():
    return re.findall(r"<loc>\s*(.*?)\s*</loc>", (ROOT / "sitemap.xml").read_text(encoding="utf-8"))

def url_for(path):
    p = "/" + path.lstrip("/")
    if p.endswith("/index.html"): p = p[: -len("index.html")]
    return BASE + p

def changed_since(ref):
    out = subprocess.run(["git", "diff", "--name-only", ref, "HEAD", "--", "src/public"],
                         cwd=REPO, capture_output=True, text=True, check=True).stdout
    return [url_for(f[len("src/public"):]) for f in out.split() if f.endswith(".html")]

def main(args):
    dry = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]
    allowed = sitemap_urls()
    if args[:1] == ["--sitemap"]:
        urls = allowed
    elif args[:1] == ["--changed"] and len(args) == 2:
        urls = changed_since(args[1])
    elif args and not args[0].startswith("--"):
        urls = [a if a.startswith("http") else url_for(a) for a in args]
    else:
        sys.exit(__doc__)

    skipped = [u for u in urls if u not in allowed]
    urls = [u for u in dict.fromkeys(urls) if u in allowed]
    for u in skipped: print("skip (not in sitemap):", u)
    if not urls: sys.exit("Nothing to submit.")
    print(f"{len(urls)} URL(s):", *urls, sep="\n  ")
    if dry: return

    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"{BASE}/{KEY}.txt",
                       "urlList": urls})
    # curl, not urllib: python.org builds on macOS ship without a CA bundle and
    # fail TLS verification until "Install Certificates.command" is run.
    r = subprocess.run(["curl", "-sS", "-m", "30", "-X", "POST", ENDPOINT,
                        "-H", "Content-Type: application/json; charset=utf-8",
                        "--data-binary", "@-", "-w", "\n%{http_code}"],
                       input=body, capture_output=True, text=True)
    if r.returncode: sys.exit(f"IndexNow: curl failed: {r.stderr.strip()}")
    text, _, code = r.stdout.rpartition("\n")
    # 403 = key file not live yet; 422 = URL not on HOST; 429 = slow down
    if code not in ("200", "202"): sys.exit(f"IndexNow: {code} {text[:300]}")
    print("IndexNow:", code, "accepted")

if __name__ == "__main__":
    main(sys.argv[1:])
