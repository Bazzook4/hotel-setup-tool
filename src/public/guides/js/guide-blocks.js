/**
 * OnlineHotelier — Shared guide page block behaviour
 *
 * Wires the FAQ accordion on guide pages the same way /tools/js/tool-blocks.js
 * does on tool pages, so the two page types behave identically: click the
 * question, the parent .faq-item gets .open, the answer shows and the + becomes
 * a minus.
 *
 * Answers stay in the DOM at all times. Only their display is toggled, so the
 * FAQPage schema and the visible copy remain in parity for crawlers.
 *
 * Safe to load on a guide with no FAQ. Skips any page that already binds its
 * own handler, so it will not double-toggle.
 */
(function () {
  function init() {
    var questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    // A guide may bind its own accordion inline. Binding again here would
    // toggle twice per click, which reads as the FAQ not opening at all.
    var probe = questions[0];
    var probeItem = probe.closest('.faq-item') || probe.parentElement;
    if (probeItem) {
      var wasOpen = probeItem.classList.contains('open');
      probe.click();
      var reacted = probeItem.classList.contains('open') !== wasOpen;
      if (reacted) {
        // Undo the probe click and hand control back to the page's own script.
        probe.click();
        return;
      }
    }

    questions.forEach(function (q) {
      if (q.dataset.faqBound === '1') return;
      q.dataset.faqBound = '1';

      // Keyboard reachable, since these are divs rather than buttons.
      if (!q.hasAttribute('tabindex')) q.setAttribute('tabindex', '0');
      if (!q.hasAttribute('role')) q.setAttribute('role', 'button');

      var item = q.closest('.faq-item') || q.parentElement;
      if (!item) return;
      q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');

      function toggle() {
        item.classList.toggle('open');
        q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      }

      q.addEventListener('click', toggle);
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });

    // Deep link support: /guides/...#faq-slug opens that item.
    if (location.hash) {
      var target = document.querySelector(location.hash + '.faq-item');
      if (target) {
        target.classList.add('open');
        var tq = target.querySelector('.faq-question');
        if (tq) tq.setAttribute('aria-expanded', 'true');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
