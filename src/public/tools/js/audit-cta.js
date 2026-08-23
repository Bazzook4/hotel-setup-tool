/**
 * OnlineHotelier — Free OTA Audit CTA
 *
 * Injects one prominent CTA panel into the flow of a tool page, placed after
 * the results block so it lands once the reader has a number in front of them.
 * Reveals on scroll rather than on load, so it reads as part of the page
 * instead of an interruption. No overlay, no dismissal, nothing that covers
 * the tool itself.
 *
 * Opt out on a page with:  <body data-audit-cta="off">
 * Override placement with: <div data-audit-cta-here></div>
 */
(function () {
  if (document.body && document.body.getAttribute('data-audit-cta') === 'off') return;
  // Never show it on the audit page itself.
  if (window.location.pathname.indexOf('/services/ota-audit') !== -1) return;
  if (document.querySelector('.oh-audit-cta')) return;

  var css = ''
    + '.oh-audit-cta{'
    +   'background:linear-gradient(135deg,#3E3D35 0%,#6E6959 100%);'
    +   'border-radius:14px;padding:2rem 2.25rem;margin:2.5rem 0;color:#fff;'
    +   'box-shadow:0 6px 24px rgba(62,61,53,0.18);'
    +   'opacity:0;transform:translateY(18px);'
    +   'transition:opacity .5s ease,transform .5s ease;'
    + '}'
    + '.oh-audit-cta.is-visible{opacity:1;transform:none;}'
    + '.oh-audit-cta-eyebrow{'
    +   'display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.12em;'
    +   'text-transform:uppercase;background:rgba(255,255,255,.16);'
    +   'padding:.25rem .6rem;border-radius:4px;margin-bottom:.85rem;color:#fff;'
    + '}'
    + '.oh-audit-cta h3{'
    +   'font-size:1.45rem;font-weight:700;line-height:1.3;margin:0 0 .6rem;color:#fff;'
    +   'border:none;padding:0;'
    + '}'
    + '.oh-audit-cta p{'
    +   'color:#fff;opacity:.92;font-size:.98rem;line-height:1.65;margin:0 0 1.5rem;max-width:60ch;'
    + '}'
    + '.oh-audit-cta-row{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;}'
    + '.oh-audit-cta-btn{'
    +   'display:inline-flex;align-items:center;gap:.5rem;background:#fff;color:#3E3D35;'
    +   'padding:.8rem 1.6rem;border-radius:8px;font-weight:700;font-size:.98rem;'
    +   'text-decoration:none;transition:transform .15s ease,box-shadow .15s ease;'
    + '}'
    + '.oh-audit-cta-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.25);}'
    + '.oh-audit-cta-note{font-size:.85rem;color:#fff;opacity:.75;}'
    + '@media (max-width:768px){'
    +   '.oh-audit-cta{padding:1.5rem 1.25rem;margin:2rem 0;border-radius:12px;}'
    +   '.oh-audit-cta h3{font-size:1.2rem;}'
    +   '.oh-audit-cta-btn{width:100%;justify-content:center;}'
    + '}'
    + '@media (prefers-reduced-motion:reduce){'
    +   '.oh-audit-cta{transition:none;opacity:1;transform:none;}'
    + '}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var el = document.createElement('div');
  el.className = 'oh-audit-cta';
  el.innerHTML = ''
    + '<span class="oh-audit-cta-eyebrow">Free &middot; No obligation</span>'
    + '<h3>Numbers are one thing. Your actual listings are another.</h3>'
    + '<p>Send us your property name and we will look at your real listings, your Google profile '
    + 'and your rates across channels, then tell you plainly what is costing you bookings and what '
    + 'to fix first. Most of it you can fix yourself, and we will say so.</p>'
    + '<div class="oh-audit-cta-row">'
    +   '<a class="oh-audit-cta-btn" href="/services/ota-audit/">Get a Free OTA Audit &rarr;</a>'
    +   '<span class="oh-audit-cta-note">Usually back within 2 working days</span>'
    + '</div>';

  // Placement, best anchor first. We want it in the reader's path directly
  // after they have seen their own numbers.
  function findAnchor() {
    var explicit = document.querySelector('[data-audit-cta-here]');
    if (explicit) return { node: explicit, mode: 'replace' };

    var selectors = [
      '.results-section', '.results-container', '#resultsSection',
      '#results', '.result-cards', '.results'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var found = document.querySelector(selectors[i]);
      if (found && found.parentNode) return { node: found, mode: 'after' };
    }
    // Fall back to sitting above the FAQ, which is still mid-page.
    var faq = document.querySelector('.faq-section, .faq-list, #faq');
    if (faq && faq.parentNode) return { node: faq, mode: 'before' };
    return null;
  }

  var anchor = findAnchor();
  if (!anchor) return;

  if (anchor.mode === 'replace') {
    anchor.node.parentNode.replaceChild(el, anchor.node);
  } else if (anchor.mode === 'after') {
    anchor.node.parentNode.insertBefore(el, anchor.node.nextSibling);
  } else {
    anchor.node.parentNode.insertBefore(el, anchor.node);
  }

  // Reveal as it comes into view. If IntersectionObserver is unavailable,
  // show it straight away rather than leaving an invisible panel behind.
  if (!('IntersectionObserver' in window)) {
    el.classList.add('is-visible');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  io.observe(el);
})();
