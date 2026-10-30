"""Reusable layouts built on gd.SVG. Each returns (wide_svg, tall_svg)."""
from gd import SVG


def timeline(p, *, steps, span, notes, status, title, desc, animate=True, span_tall=None):
    """A row of five steps, a bracket naming the total time, and up to two
    note boxes hanging off steps by dashed lines.

    steps:  5 dicts with title, wide (two short sub lines), tall (one line);
            the last step is drawn as the outcome box.
    span:   bracket label, e.g. 'About two weeks from sign-up to first booking'.
    span_tall: optional list of lines for the phone layout (default: split at ' to ').
    notes:  up to 2 dicts with step (0-4), title, lines (up to 4).
    status: 5 step lines for the animated status line.
    """
    n = len(steps)
    win = [(round(i / n, 2), round((i + 1) / n - (0.02 if i == n - 1 else 0), 2)) for i in range(n)]

    # wide ---------------------------------------------------------------
    w = SVG(p, '')
    bw, gap, top, bh = 128, 18, 20, 96
    xs = [2 + i * (bw + gap) for i in range(n)]
    for i, (x, st) in enumerate(zip(xs, steps)):
        w.card(x, top, bw, bh, st['title'], st['wide'], kind='out' if i == n - 1 else '', head=f'Step {i + 1}', pad=12)
        if i < n - 1:
            w.line(f'M{x + bw + 1},{top + 48} H{xs[i + 1] - 1}', 'hot')
    w.parts.append(f'<path class="gd-line" d="M{xs[0]},{top + bh + 14} v8 H{xs[-1] + bw} v-8"/>')
    note_y, note_w = 196, 340
    for k, nt in enumerate(notes):
        nx = 2 if k == 0 else 372
        cx = xs[nt['step']] + bw / 2
        w.line(f'M{cx},{top + bh + 2} V{note_y - 2}', 'dash')
        w.card(nx, note_y, note_w, 40 + 17 * len(nt['lines']), nt['title'], nt['lines'])
    # Drawn after the dashed connectors so its white halo sits on top of them.
    w.text(357, top + bh + 42, span, 'gd-label gd-halo', 'middle')
    sy = note_y + 40 + 17 * max(len(nt['lines']) for nt in notes) + 30
    if animate:
        for i, (a, b) in enumerate(win):
            w.highlight(xs[i], top, bw, bh, a, b)
        w.steps(2, sy, status, win)
    wide = w.render('gd-wide', f'0 0 715 {sy + 12}', title, desc, animate)

    # tall ---------------------------------------------------------------
    t = SVG(p, 'm')
    tx, tw, th, step_gap = 30, 300, 58, 22
    ys = [10 + i * (th + step_gap) for i in range(n)]
    for i, (y, st) in enumerate(zip(ys, steps)):
        t.box(tx, y, tw, th, 'out' if i == n - 1 else '')
        t.text(tx + 14, y + 25, f'{i + 1}. {st["title"]}', 'gd-label')
        t.text(tx + 14, y + 44, st['tall'], 'gd-sub')
        if i < n - 1:
            t.line(f'M180,{y + th + 1} V{ys[i + 1] - 1}', 'hot')
    yb = ys[-1] + th + 30
    if span_tall is None:
        head, _, rest = span.partition(' to ')
        span_tall = [head, 'to ' + rest] if rest else [span]
    for i, part in enumerate(span_tall):
        t.text(180, yb + i * 19, part, 'gd-label', 'middle')
    y = yb + 19 * (len(span_tall) - 1) + 22
    for nt in notes:
        h = 40 + 17 * len(nt['lines'])
        t.card(tx, y, tw, h, nt['title'], nt['lines'])
        y += h + 16
    sy = y + 18
    if animate:
        for i, (a, b) in enumerate(win):
            t.highlight(tx, ys[i], tw, th, a, b)
        t.steps(10, sy, status, win)
    tall = t.render('gd-tall', f'0 0 360 {sy + 12}', title, desc, animate)
    return wide, tall
