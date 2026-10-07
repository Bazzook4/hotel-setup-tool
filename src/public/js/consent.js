/* Cookie consent banner.
 *
 * The consent DEFAULT is not set here. It is declared inline in every page's
 * head, before the GA4 loader, because a deferred script cannot run early
 * enough to stop analytics_storage being written. This file only renders the
 * banner and sends the UPDATE once the visitor chooses.
 *
 * Storage: a single first-party key, oh_consent, holding 'granted' or
 * 'denied'. No cookie is set by this file, so nothing here is itself a
 * non-essential cookie. localStorage can throw in private mode or with site
 * data blocked, so every access is wrapped; on failure the banner simply
 * shows again next visit, which is the safe direction to fail.
 *
 * DPDP section 6 requires consent that is free, specific, informed and given
 * by clear affirmative action, so Accept and Decline carry equal weight: same
 * size, same prominence, neither pre-selected.
 */
(function () {
  'use strict';

  var KEY = 'oh_consent';
  var VERSION = 1;

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== VERSION) return null;
      return parsed.state === 'granted' ? 'granted' : 'denied';
    } catch (e) {
      return null;
    }
  }

  function write(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ v: VERSION, state: state }));
    } catch (e) {
      /* Private mode or blocked site data. The choice applies to this page
         view regardless; it just will not be remembered. */
    }
  }

  function apply(state) {
    if (typeof window.gtag !== 'function') return;
    var granted = state === 'granted' ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      analytics_storage: granted,
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted
    });
  }

  function dismiss(el, state) {
    write(state);
    apply(state);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function render() {
    var wrap = document.createElement('div');
    wrap.className = 'oh-consent';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie consent');
    wrap.setAttribute('aria-live', 'polite');

    var text = document.createElement('p');
    text.className = 'oh-consent-text';
    text.innerHTML =
      'We use analytics cookies to see which guides people actually read. ' +
      'Nothing is set until you choose. Read our ' +
      '<a href="/privacy/">privacy policy</a>.';

    var row = document.createElement('div');
    row.className = 'oh-consent-actions';

    var decline = document.createElement('button');
    decline.type = 'button';
    decline.className = 'oh-consent-btn oh-consent-decline';
    decline.textContent = 'Decline';

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'oh-consent-btn oh-consent-accept';
    accept.textContent = 'Accept';

    decline.addEventListener('click', function () { dismiss(wrap, 'denied'); });
    accept.addEventListener('click', function () { dismiss(wrap, 'granted'); });

    row.appendChild(decline);
    row.appendChild(accept);
    wrap.appendChild(text);
    wrap.appendChild(row);
    document.body.appendChild(wrap);
  }

  function start() {
    var saved = read();
    if (saved) {
      /* Returning visitor: re-send their choice, show nothing. */
      apply(saved);
      return;
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
