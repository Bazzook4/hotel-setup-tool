/**
 * OnlineHotelier — Shared tool page block behaviour
 *
 * Wires the FAQ accordion the same way on every tool page. Matches the
 * Revenue Management Setup tool, which is the reference: click the question,
 * the parent .faq-item gets .open, the answer shows and the + becomes a minus.
 *
 * Safe to load on a page with no FAQ. Skips any page that already binds its
 * own handler, so it will not double-toggle.
 */
(function () {
  function init() {
    var questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    // Several tools bind their own accordion inline. Binding again here would
    // toggle twice per click, which reads as the FAQ not opening at all. If a
    // page already opens an item on click, leave it alone.
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
      // A page may have bound this already in its own inline script.
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
