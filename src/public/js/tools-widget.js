/**
 * OnlineHotelier — Tools Launcher Widget
 * Floating FAB that expands into a panel listing all free tools.
 * No dependencies required.
 */
(function () {

  var TOOLS = [
    { icon: '📊', title: 'Revenue Management Setup',      href: '/tools/revenue-management-tool/' },
    { icon: '💰', title: 'OTA Commission Calculator',     href: '/tools/ota-commission-calculator/' },
    { icon: '🏷️', title: 'Discount Settlement Calculator', href: '/tools/hotel-discount-calculator/' },
    { icon: '📈', title: 'OTA Dependency Calculator',     href: '/tools/ota-dependency-calculator/' },
    { icon: '🔍', title: 'Hotel Rate Shopper',            href: '/tools/rate-shopper/' },
    { icon: '🎯', title: 'Competitor Rate Intelligence',  href: '/tools/competitor-analysis/' },
    { icon: '📅', title: 'Demand Calendar 2026',          href: '/tools/demand-calendar/' },
    { icon: '⚖️', title: 'Break Even Calculator',         href: '/tools/break-even-calculator/' },
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
      font-size: 1.1rem;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
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
  var listItems = TOOLS.map(function(t) {
    return '<a class="oh-tool-item" href="' + t.href + '">' +
      '<span class="oh-tool-icon">' + t.icon + '</span>' +
      t.title +
    '</a>';
  }).join('');

  var html = `
    <div id="oh-tools-widget">
      <div id="oh-tools-panel">
        <div class="oh-tools-header">
          <div class="oh-tools-header-text">
            <div class="oh-tools-title">Free Hotel Tools</div>
            <div class="oh-tools-sub">8 tools · no signup needed</div>
          </div>
          <button class="oh-tools-close" id="oh-tools-close-btn">✕</button>
        </div>
        <div class="oh-tools-list">
          ${listItems}
        </div>
        <div class="oh-tools-footer">
          <a href="/tools/">View all tools →</a>
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
