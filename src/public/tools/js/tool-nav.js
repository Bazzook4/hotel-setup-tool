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
    slug: 'revenue-management-results/',
    title: 'Revenue Playbook',
    icon: '\uD83D\uDCD6',
    desc: 'Your personalized pricing action plan'
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
    slug: 'demand-calendar/',
    title: 'Demand Calendar 2026',
    icon: '\uD83D\uDCC5',
    desc: 'Long weekends, weddings & festivals'
  }
];

const TOOLS_BASE = '/tools/';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  var currentPath = window.location.pathname;

  buildToolSidebar(currentPath);
  setupToolSidebarToggle();
  injectToolPrevNext(currentPath);
});

// ===== SIDEBAR =====
function buildToolSidebar(currentPath) {
  var sidebar = document.querySelector('.tool-sidebar');
  if (!sidebar) return;

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

  // Related Guides link
  html += '<div class="sidebar-section-header" style="margin-top: 1.5rem;">Related</div>';
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

// ===== PREV/NEXT NAVIGATION =====
function injectToolPrevNext(currentPath) {
  var container = document.querySelector('.prev-next-nav');
  if (!container) return;

  var prevTool = null;
  var nextTool = null;

  for (var i = 0; i < TOOLS.length; i++) {
    if (currentPath.indexOf(TOOLS[i].slug) !== -1) {
      if (i > 0) {
        prevTool = { title: TOOLS[i - 1].title, href: TOOLS_BASE + TOOLS[i - 1].slug };
      }
      if (i < TOOLS.length - 1) {
        nextTool = { title: TOOLS[i + 1].title, href: TOOLS_BASE + TOOLS[i + 1].slug };
      }
      break;
    }
  }

  if (!prevTool && !nextTool) {
    container.style.display = 'none';
    return;
  }

  var html = '';
  if (prevTool) {
    html += '<a href="' + prevTool.href + '" class="prev-next-link prev">';
    html += '<div class="pn-direction">Previous</div>';
    html += '<div class="pn-title">' + prevTool.title + '</div>';
    html += '</a>';
  } else {
    html += '<div class="prev-next-placeholder"></div>';
  }

  if (nextTool) {
    html += '<a href="' + nextTool.href + '" class="prev-next-link next">';
    html += '<div class="pn-direction">Next</div>';
    html += '<div class="pn-title">' + nextTool.title + '</div>';
    html += '</a>';
  } else {
    html += '<div class="prev-next-placeholder"></div>';
  }

  container.innerHTML = html;
}
