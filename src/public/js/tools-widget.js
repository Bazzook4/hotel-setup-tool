/**
 * OnlineHotelier — Tools Launcher Widget
 * Floating FAB that expands into a panel listing all free tools.
 * No dependencies required.
 */
(function () {

  var BASE = 'https://www.onlinehotelier.com';
  var TOOLS = [
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><rect x="5" y="11" width="4" height="7"/><rect x="12" y="6" width="4" height="12"/><rect x="19" y="14" width="2" height="4"/></svg>', title: 'Revenue Management Setup',      href: BASE + '/tools/revenue-management-tool/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h12M6 8h12M15 3c0 4-3 5-6 5l7 8"/></svg>', title: 'OTA Commission Calculator',     href: BASE + '/tools/ota-commission-calculator/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h12M6 8h12M15 3c0 4-3 5-6 5l7 8"/></svg>', title: 'Revenue & Profit Estimator',    href: BASE + '/tools/revenue-profit-estimator/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>', title: 'Discount Settlement Calculator', href: BASE + '/tools/hotel-discount-calculator/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>', title: 'OTA Dependency Calculator',     href: BASE + '/tools/ota-dependency-calculator/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>', title: 'Hotel Rate Shopper',            href: BASE + '/tools/rate-shopper/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>', title: 'Competitor Rate Intelligence',  href: BASE + '/tools/competitor-analysis/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></svg>', title: 'Demand Calendar 2026',          href: BASE + '/tools/demand-calendar/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18"/><path d="M6 21h12"/><path d="M3 8h18"/><path d="M6 8l-3 6h6z"/><path d="M18 8l-3 6h6z"/></svg>', title: 'Break Even Calculator',         href: BASE + '/tools/break-even-calculator/' },
  ];

  var SERVICES = [
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>', title: 'Free OTA Audit',            href: BASE + '/services/ota-audit/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V6l7-3 7 3v15"/><path d="M9 21v-5h6v5"/><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01"/></svg>', title: 'Hotel OTA Listing',         href: BASE + '/services/independent-hotel-ota-listing/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11l9-7 9 7"/><path d="M5 10v11h14V10"/><path d="M10 21v-6h4v6"/></svg>', title: 'Vacation Rental Listing',   href: BASE + '/services/vacation-rental-ota-listing/' },
    { icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>', title: 'Hotel Website',            href: BASE + '/services/hotel-website/' },
  ];

  // ── Styles ──────────────────────────────────────────────────────────────────
  var css = `
    #oh-tools-widget {
      position: fixed;
      bottom: 7.5rem;
      right: 2rem;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.75rem;
      font-family: 'Avenir', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #oh-tools-panel {
      display: none;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      width: 300px;
      overflow: hidden;
      animation: ohToolsSlideUp 0.25s ease;
    }
    #oh-tools-panel.oh-open { display: block; }
    @keyframes ohToolsSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .oh-tools-header {
      background: linear-gradient(135deg, #3E3D35, #89826E);
      color: white;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .oh-tools-header-text .oh-tools-title {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .oh-tools-header-text .oh-tools-sub {
      font-size: 0.75rem;
      opacity: 0.75;
      margin-top: 0.1rem;
    }
    .oh-tools-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.8);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .oh-tools-list {
      padding: 0.5rem 0;
      max-height: 360px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    .oh-tools-list::-webkit-scrollbar { width: 4px; }
    .oh-tools-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    .oh-tool-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem;
      text-decoration: none;
      color: #3E3D35;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.15s;
      border-left: 3px solid transparent;
    }
    .oh-tool-item:hover {
      background: rgba(137,130,110,0.08);
      border-left-color: #89826E;
      color: #3E3D35;
    }
    .oh-tool-item .oh-tool-icon {
      flex: 0 0 auto;
      width: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .oh-tool-item .oh-tool-icon .oh-icon {
      width: 1.15rem; height: 1.15rem;
      min-width: 1.15rem; min-height: 1.15rem;
      color: #89826E;
    }
    .oh-tools-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid #f0efe8;
      text-align: center;
    }
    .oh-tools-footer a {
      font-size: 0.8rem;
      color: #89826E;
      text-decoration: none;
      font-weight: 600;
    }
    .oh-tools-footer a:hover { text-decoration: underline; }
    #oh-tools-fab {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #3E3D35;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(62,61,53,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
      color: white;
    }
    #oh-tools-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(62,61,53,0.5);
    }
    @media (max-width: 768px) {
      #oh-tools-widget { bottom: 6rem; right: 1rem; }
      #oh-tools-panel { width: 270px; }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── HTML ─────────────────────────────────────────────────────────────────────
  var toolItems = TOOLS.map(function(t) {
    return '<a class="oh-tool-item" href="' + t.href + '">' +
      '<span class="oh-tool-icon">' + t.icon + '</span>' +
      t.title +
    '</a>';
  }).join('');

  var serviceItems = SERVICES.map(function(s) {
    return '<a class="oh-tool-item" href="' + s.href + '">' +
      '<span class="oh-tool-icon">' + s.icon + '</span>' +
      s.title +
    '</a>';
  }).join('');

  var html = `
    <div id="oh-tools-widget">
      <div id="oh-tools-panel">
        <div class="oh-tools-header">
          <div class="oh-tools-header-text">
            <div class="oh-tools-title">Free Hotel Tools</div>
            <div class="oh-tools-sub">9 tools · no signup needed</div>
          </div>
          <button class="oh-tools-close" id="oh-tools-close-btn">✕</button>
        </div>
        <div class="oh-tools-list">
          ${toolItems}
          <div style="padding: 0.5rem 1.25rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #3E3D35; border-top: 1px solid #f0efe8; margin-top: 0.25rem; padding-top: 0.75rem;">Our Services</div>
          ${serviceItems}
        </div>
        <div class="oh-tools-footer">
          <a href="https://www.onlinehotelier.com/tools/">All tools</a> &nbsp;·&nbsp; <a href="https://www.onlinehotelier.com/services/">All services</a>
        </div>
      </div>
      <button id="oh-tools-fab" aria-label="Browse free hotel tools" title="Free Hotel Tools">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg>
      </button>
    </div>
  `;

  var container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // ── Logic ────────────────────────────────────────────────────────────────────
  var panel = document.getElementById('oh-tools-panel');
  var fab   = document.getElementById('oh-tools-fab');

  fab.addEventListener('click', function () {
    panel.classList.toggle('oh-open');
  });

  document.getElementById('oh-tools-close-btn').addEventListener('click', function () {
    panel.classList.remove('oh-open');
  });

  // Public API
  window.ohTools = {
    open:   function () { panel.classList.add('oh-open'); },
    close:  function () { panel.classList.remove('oh-open'); },
    toggle: function () { panel.classList.toggle('oh-open'); }
  };

})();
