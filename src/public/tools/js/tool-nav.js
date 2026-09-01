/**
 * Tool Navigation System
 * Sidebar, Prev/Next for tool pages
 */

// ===== TOOLS DATA =====
const TOOLS = [
  {
    slug: 'revenue-management-tool/',
    title: 'Revenue Management Setup',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><rect x="5" y="11" width="4" height="7"/><rect x="12" y="6" width="4" height="12"/><rect x="19" y="14" width="2" height="4"/></svg>',
    desc: 'Configure dynamic pricing for your hotel'
  },
  {
    slug: 'guest-acquisition-cost/',
    title: 'Guest Acquisition Cost',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    desc: 'OTA vs direct \u2014 true cost per booking'
  },
  {
    slug: 'ota-commission-calculator/',
    title: 'OTA Commission Calculator',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h12M6 8h12M15 3c0 4-3 5-6 5l7 8"/></svg>',
    desc: 'See how much OTAs take per booking'
  },
  {
    slug: 'hotel-discount-calculator/',
    title: 'Discount Settlement Calculator',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    desc: 'Know your actual earnings after discounts'
  },
  {
    slug: 'ota-dependency-calculator/',
    title: 'OTA Dependency Calculator',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    desc: 'Analyze your booking channel mix'
  },
  {
    slug: 'rate-shopper/',
    title: 'Hotel Rate Shopper',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    desc: 'Compare Google Hotel rates'
  },
  {
    slug: 'competitor-analysis/',
    title: 'Competitor Rate Intelligence',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    desc: 'Compare your rates vs nearby competitors'
  },
  {
    slug: 'demand-calendar/',
    title: 'Demand Calendar 2026',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/></svg>',
    desc: 'Long weekends, weddings & festivals'
  },
  {
    slug: 'break-even-calculator/',
    title: 'Break Even Calculator',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18"/><path d="M6 21h12"/><path d="M3 8h18"/><path d="M6 8l-3 6h6z"/><path d="M18 8l-3 6h6z"/></svg>',
    desc: 'Find your minimum occupancy and room rate'
  },
  {
    slug: 'revenue-profit-estimator/',
    title: 'Revenue & Profit Estimator',
    icon: '<svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h12M6 8h12M15 3c0 4-3 5-6 5l7 8"/></svg>',
    desc: 'Full monthly P&L with OTA costs and net margin'
  }
];

const TOOLS_BASE = '/tools/';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  var currentPath = window.location.pathname;
  var toolName = document.body.getAttribute('data-tool-name') || 'Tool';

  buildToolNav();
  buildToolBreadcrumb(toolName);
  buildToolSidebar(currentPath);
  setupToolSidebarToggle();
});

// ===== SIDEBAR =====
function buildToolSidebar(currentPath) {
  var sidebar = document.querySelector('.tool-sidebar');
  if (!sidebar) return;

  // Service pages don't show the sidebar
  if (currentPath.indexOf('/services/') !== -1) {
    document.body.classList.add('service-page');
    sidebar.style.display = 'none';
    var toggle = document.querySelector('.sidebar-toggle');
    var overlay = document.querySelector('.sidebar-overlay');
    if (toggle) toggle.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    return;
  }

  var html = '<nav aria-label="Tool navigation">';
  html += '<div class="sidebar-section-header">Tools</div>';
  html += '<ul class="sidebar-tool-list">';

  // All Tools overview link
  var indexActive = (currentPath === TOOLS_BASE || currentPath === TOOLS_BASE + 'index.html') ? ' class="active"' : '';
  html += '<li class="tool-overview"><a href="' + TOOLS_BASE + '"' + indexActive + '>All Tools</a></li>';

  TOOLS.forEach(function(tool) {
    var href = TOOLS_BASE + tool.slug;
    var isActive = currentPath.indexOf(tool.slug) !== -1 ? ' class="active"' : '';
    html += '<li><a href="' + href + '"' + isActive + '>';
    html += '<span class="tool-nav-icon">' + tool.icon + '</span> ';
    html += tool.title;
    html += '</a></li>';
  });

  html += '</ul>';

  html += '</ul>';

  // Services section
  html += '<div class="sidebar-section-header" style="margin-top: 1.5rem;">Our Services</div>';
  html += '<ul class="sidebar-tool-list">';
  var sAudit = currentPath.indexOf('/services/ota-audit') !== -1 ? ' class="active"' : '';
  html += '<li><a href="/services/ota-audit/"' + sAudit + '><span class="tool-nav-icon"><svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></span> Free OTA Audit</a></li>';
  var s1Active = currentPath.indexOf('/services/independent-hotel-ota-listing') !== -1 ? ' class="active"' : '';
  html += '<li><a href="/services/independent-hotel-ota-listing/"' + s1Active + '><span class="tool-nav-icon"><svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M5 21V6l7-3 7 3v15"/><path d="M9 21v-5h6v5"/><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01"/></svg></span> Hotel OTA Listing</a></li>';
  var s2Active = currentPath.indexOf('/services/vacation-rental-ota-listing') !== -1 ? ' class="active"' : '';
  html += '<li><a href="/services/vacation-rental-ota-listing/"' + s2Active + '><span class="tool-nav-icon"><svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11l9-7 9 7"/><path d="M5 10v11h14V10"/><path d="M10 21v-6h4v6"/></svg></span> Vacation Rental Listing</a></li>';
  var s4Active = currentPath.indexOf('/services/hotel-website') !== -1 ? ' class="active"' : '';
  html += '<li><a href="/services/hotel-website/"' + s4Active + '><span class="tool-nav-icon"><svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg></span> Hotel Website</a></li>';
  html += '<li><a href="/services/" style="font-size:0.8rem; color: #89826E; font-weight:600;"><span class="tool-nav-icon">\u2192</span> All Services</a></li>';
  html += '</ul>';

  // Related Guides link
  html += '<div class="sidebar-section-header" style="margin-top: 1rem;">Related</div>';
  html += '<ul class="sidebar-tool-list">';
  html += '<li><a href="/guides/"><span class="tool-nav-icon"><svg class="oh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4v16a1 1 0 0 0 1 1h15"/><path d="M20 21V3H6a2 2 0 0 0-2 2"/><path d="M8 8h8M8 12h5"/></svg></span> Browse Guides</a></li>';
  html += '</ul>';

  html += '</nav>';
  sidebar.innerHTML = html;
}

// ===== SIDEBAR TOGGLE (mobile) =====
function setupToolSidebarToggle() {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('.tool-sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', function() {
    var isOpen = sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
    toggle.textContent = isOpen ? '\u2715' : '\u2630';
  });

  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      toggle.textContent = '\u2630';
    });
  }
}

// Prev/Next navigation removed - not needed for standalone tools


// ===== SITE NAV =====
// Delegated to /js/nav.js — loaded via script tag on each tool page
function buildToolNav() {
  // nav.js handles injection automatically on DOMContentLoaded
}

// ===== BREADCRUMB =====
function buildToolBreadcrumb(toolName) {
  var bc = document.getElementById('tool-breadcrumb');
  if (!bc) return;

  var isService = window.location.pathname.indexOf('/services/') !== -1;

  bc.className = 'breadcrumb';
  if (isService) {
    bc.innerHTML =
      '<div class="breadcrumb-container">' +
        '<a href="/">Home</a> › <a href="/services/">Services</a> › ' + toolName +
      '</div>';
  } else {
    bc.innerHTML =
      '<div class="breadcrumb-container">' +
        '<a href="/">Home</a> › <a href="/tools/">Tools</a> › ' + toolName +
      '</div>';
  }
}
