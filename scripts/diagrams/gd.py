"""Guide diagram toolkit. See memory/diagram-standard.md for the rules.

A diagram spec (one file per guide in this folder) draws a wide and a tall
SVG with the helpers below, then calls build(). build() inserts or replaces
<figure id="..."> in the guide, renders the 1200x630 share image, and wires
og:image, twitter:image, og:image:alt, the Article schema image,
dateModified and the sitemap lastmod.

Run a spec from the repo root:  python3 scripts/diagrams/<spec>.py
Add --preview [out.html] to only write a standalone preview page.
"""
import datetime, html, json, os, re, subprocess, sys, tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUBLIC = os.path.join(ROOT, 'src', 'public')
SITE = 'https://www.onlinehotelier.com'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
TODAY = datetime.date.today().isoformat()


def esc(s):
    return html.escape(s, quote=False)


class SVG:
    """One SVG layout. `p` is the id prefix for this diagram, `sfx` keeps the
    wide and tall copies' ids unique ('' and 'm')."""

    def __init__(self, p, sfx, dur=10):
        self.p, self.sfx, self.dur = p, sfx, dur
        self.parts, self.anim = [], []

    # drawing -----------------------------------------------------------
    def text(self, x, y, s, cls='gd-sub', anchor='start'):
        self.parts.append(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{esc(s)}</text>')

    def box(self, x, y, w, h, kind='', rx=10):
        cls = 'gd-box' + {'': '', 'main': ' gd-main', 'out': ' gd-direct'}[kind]
        self.parts.append(f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/>')

    def card(self, x, y, w, h, title, subs=(), kind='', head=None, pad=14):
        """Box with an optional small heading line, a bold title and sub lines."""
        self.box(x, y, w, h, kind)
        ty = y + 24
        if head:
            self.text(x + pad, ty, head, 'gd-sub'); ty += 21
        self.text(x + pad, ty, title, 'gd-label')
        for i, s in enumerate(subs):
            self.text(x + pad, ty + 19 + i * 17, s, 'gd-sub')

    def line(self, d, kind='', arrow=True):
        cls = 'gd-line' + (' gd-hot' if 'hot' in kind else '') + (' gd-dash' if 'dash' in kind else '')
        mk = f' marker-end="url(#{self.p}-ah{"d" if "hot" in kind else ""}{self.sfx})"' if arrow else ''
        self.parts.append(f'<path class="{cls}" d="{d}"{mk}/>')

    def note(self, x, y, lines, anchor='start'):
        for i, s in enumerate(lines):
            self.text(x, y + i * 16, s, 'gd-note', anchor)

    def leader(self, d):
        self.parts.append(f'<path d="{d}" fill="none" stroke="#89826E" stroke-width="1"/>')

    # animation ---------------------------------------------------------
    def dot(self, d, a, b):
        D = self.dur
        self.anim.append(
            f'<circle r="5" fill="#3E3D35" opacity="0"><animateMotion dur="{D}s" repeatCount="indefinite" path="{d}" '
            f'calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;{a};{b};1"/>'
            f'<animate attributeName="opacity" dur="{D}s" repeatCount="indefinite" calcMode="discrete" '
            f'values="0;1;0" keyTimes="0;{a};{b}"/></circle>')

    def show_el(self, el, a, b):
        D = self.dur
        self.anim.append(
            f'<g opacity="0">{el}<animate attributeName="opacity" dur="{D}s" repeatCount="indefinite" '
            f'calcMode="discrete" values="0;1;0" keyTimes="0;{a};{b}"/></g>')

    def show(self, x, y, s, a, b, cls='gd-tag', anchor='start'):
        self.show_el(f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{esc(s)}</text>', a, b)

    def highlight(self, x, y, w, h, a, b, rx=10):
        """Dark outline over a box while its step is active."""
        self.show_el(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="none" stroke="#3E3D35" stroke-width="2.4"/>', a, b)

    def steps(self, x, y, lines, windows):
        """Numbered status line under the diagram, one line per window."""
        for s, (a, b) in zip(lines, windows):
            self.show(x, y, s, a, b, 'gd-status')

    # output ------------------------------------------------------------
    def render(self, cls, viewbox, title, desc, animate=True):
        p, sfx = self.p, self.sfx
        defs = (f'<defs><marker id="{p}-ah{sfx}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
                f'orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9" fill="none" stroke="#89826E" stroke-width="1.6"/></marker>'
                f'<marker id="{p}-ahd{sfx}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
                f'orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9" fill="none" stroke="#3E3D35" stroke-width="1.6"/></marker></defs>')
        tid, did = f'{p}-title{"-" + sfx if sfx else ""}', f'{p}-desc{"-" + sfx if sfx else ""}'
        anim = ('<g class="gd-anim">' + ''.join(self.anim) + '</g>') if (animate and self.anim) else ''
        return (f'<svg class="{cls}" viewBox="{viewbox}" role="img" aria-labelledby="{tid} {did}">'
                f'<title id="{tid}">{esc(title)}</title><desc id="{did}">{esc(desc)}</desc>'
                + defs + ''.join(self.parts) + anim + '</svg>')


def curve(x1, y1, x2, y2, horizontal=True):
    if horizontal:
        m = (x1 + x2) / 2
        return f'M{x1},{y1} C{m},{y1} {m},{y2} {x2},{y2}'
    m = (y1 + y2) / 2
    return f'M{x1},{y1} C{x1},{m} {x2},{m} {x2},{y2}'


# page wiring -----------------------------------------------------------------

def _replace_once(s, old, new, what):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'{what}: expected 1 match, found {n}')
    return s.replace(old, new)


def build(*, page, fig_id, wide, tall, caption, title, desc, anchor_after,
          share_title, share_sub, image_slug, image_alt, wide_static):
    """page: path under src/public, e.g. 'guides/ota/x.html'.
    wide/tall: rendered SVG strings. anchor_after: exact HTML the figure is
    inserted after on first build (ignored once the figure exists)."""
    path = os.path.join(PUBLIC, page)
    s = open(path, encoding='utf-8').read()
    fig = (f'<figure class="guide-diagram" id="{fig_id}">' + wide + tall +
           f'<figcaption>{esc(caption)}</figcaption></figure>')
    existing = re.search(rf'<figure class="guide-diagram" id="{re.escape(fig_id)}">.*?</figure>', s, re.S)
    if existing:
        s = s[:existing.start()] + fig + s[existing.end():]
    else:
        s = _replace_once(s, anchor_after, anchor_after + '\n\n          ' + fig + '\n', 'anchor')

    img_url = f'{SITE}/images/guides/{image_slug}.png'
    s = re.sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{img_url}">', s, count=1)
    s = re.sub(r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{img_url}">', s, count=1)
    s = re.sub(r'<meta property="og:image:alt" content="[^"]*">',
               f'<meta property="og:image:alt" content="{html.escape(image_alt)}">', s, count=1)

    # Article schema: set image and dateModified, keep everything else as is.
    def fix_article(m):
        body = m.group(1)
        data = json.loads(body)
        if data.get('@type') != 'Article':
            return m.group(0)
        data['image'] = {'@type': 'ImageObject', 'url': img_url, 'width': 1200, 'height': 630, 'caption': title}
        data['dateModified'] = TODAY
        return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n  </script>'
    s = re.sub(r'<script type="application/ld\+json">(.*?)</script>', fix_article, s, flags=re.S)
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        json.loads(b)
    open(path, 'w', encoding='utf-8').write(s)

    sm = os.path.join(PUBLIC, 'sitemap.xml')
    m = open(sm, encoding='utf-8').read()
    loc = f'<loc>{SITE}/{page}</loc>'
    m2 = re.sub(rf'({re.escape(loc)}\s*<lastmod>)[^<]*(</lastmod>)', rf'\g<1>{TODAY}\g<2>', m)
    if m2 == m and loc not in m:
        print('warning: page not in sitemap')
    open(sm, 'w', encoding='utf-8').write(m2)

    render_share(share_title, share_sub, wide_static, os.path.join(PUBLIC, 'images', 'guides', image_slug + '.png'))
    print(f'built {fig_id} into {page}; share image {image_slug}.png')


def _diagram_css():
    css = open(os.path.join(PUBLIC, 'guides', 'css', 'guide-layout.css'), encoding='utf-8').read()
    return css[css.index('/* Guide diagrams'):]


def render_share(title, sub, svg, out):
    page = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
body{{background:#F8F8F4;font-family:'Avenir','DM Sans',-apple-system,sans-serif;box-sizing:border-box;padding:44px 64px 0}}
h1{{margin:0 0 6px;font-size:44px;letter-spacing:-0.02em;color:#3E3D35;line-height:1.15}}
.sub{{font-size:21px;color:#6E6959;margin:0 0 10px}}
.brand{{position:absolute;left:64px;bottom:30px;font-size:19px;font-weight:700;color:#3E3D35}} .brand span{{color:#89826E;font-weight:600}}
.stage{{position:absolute;left:64px;right:64px;top:150px;bottom:70px;display:flex;align-items:center;justify-content:center}}
.stage svg{{display:block;max-width:100%;max-height:100%;width:auto;height:100%}}
{_diagram_css()}</style></head><body><h1>{esc(title)}</h1><p class="sub">{esc(sub)}</p>
<div class="stage">{svg}</div><div class="brand">OnlineHotelier <span>· onlinehotelier.com</span></div></body></html>'''
    fd, tmp = tempfile.mkstemp(suffix='.html')
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        f.write(page)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    f'--screenshot={out}', '--window-size=1200,630', f'file://{tmp}'],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def preview(wide, tall, caption, out=None):
    out = out or os.path.join(tempfile.gettempdir(), 'gd-preview.html')
    page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{{margin:0;background:#F8F8F4;font-family:'Avenir','DM Sans',-apple-system,sans-serif;color:#444}}
.article-content{{max-width:630px;margin:2rem auto;background:#fff;border-radius:12px;padding:2.5rem}}
{_diagram_css()}</style></head><body><div class="article-content"><figure class="guide-diagram">{wide}{tall}
<figcaption>{esc(caption)}</figcaption></figure></div>
<script>var m=location.hash.match(/t=([\\d.]+)/);if(m){{document.querySelectorAll('svg').forEach(function(v){{v.pauseAnimations();v.setCurrentTime(+m[1]);}});}}</script></body></html>'''
    open(out, 'w', encoding='utf-8').write(page)
    return out


def main(spec):
    """spec: function(animate:bool) -> dict with wide, tall and build kwargs."""
    d = spec(True)
    if '--preview' in sys.argv:
        print(preview(d['wide'], d['tall'], d['caption'], sys.argv[-1] if sys.argv[-1].endswith('.html') else None))
        return
    d['wide_static'] = spec(False)['wide']
    build(**d)
