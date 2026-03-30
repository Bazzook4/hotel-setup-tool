/**
 * Tool Navigation System
 * Sidebar, Prev/Next for tool pages
 */

// ===== TOOLS DATA =====
const TOOLS = [
  {
    slug: 'revenue-management-tool/',
    title: 'Revenue Management Setup',
    icon: '\uD83D\uDCCA',
    desc: 'Configure dynamic pricing for your hotel'
  },
  {
    slug: 'ota-commission-calculator/',
    title: 'OTA Commission Calculator',
    icon: '\uD83D\uDCB0',
    desc: 'See how much OTAs take per booking'
  },
  {
    slug: 'hotel-discount-calculator/',
    title: 'Discount Settlement Calculator',
    icon: '\uD83C\uDFF7\uFE0F',
    desc: 'Know your actual earnings after discounts'
  },
  {
    slug: 'ota-dependency-calculator/',
    title: 'OTA Dependency Calculator',
    icon: '\uD83D\uDCC8',
    desc: 'Analyze your booking channel mix'
  },
  {
    slug: 'rate-shopper/',
    title: 'Hotel Rate Shopper',
    icon: '\uD83D\uDD0D',
    desc: 'Compare Google Hotel rates'
  },
  {
    slug: 'competitor-analysis/',
    title: 'Competitor Rate Intelligence',
    icon: '\uD83C\uDFAF',
    desc: 'Compare your rates vs nearby competitors'
  },
  {
    slug: 'demand-calendar/',
    title: 'Demand Calendar 2026',
    icon: '\uD83D\uDCC5',
    desc: 'Long weekends, weddings & festivals'
  },
  {
    slug: 'break-even-calculator/',
    title: 'Break Even Calculator',
    icon: '\u2696\uFE0F',
    desc: 'Find your minimum occupancy and room rate'
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
  html += '<div class="sidebar-section-header" style="margin-top: 1.5rem;">Services</div>';
  html += '<ul class="sidebar-tool-list">';
  var gmbActive = currentPath.indexOf('/services/google-my-business') !== -1 ? ' class="active"' : '';
  html += '<li><a href="/services/google-my-business/"' + gmbActive + '><span class="tool-nav-icon">\uD83D\uDCCD</span> Google My Business</a></li>';
  html += '</ul>';

  // Related Guides link
  html += '<div class="sidebar-section-header" style="margin-top: 1rem;">Related</div>';
  html += '<ul class="sidebar-tool-list">';
  html += '<li><a href="/guides/"><span class="tool-nav-icon">\uD83D\uDCDA</span> Browse Guides</a></li>';
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
