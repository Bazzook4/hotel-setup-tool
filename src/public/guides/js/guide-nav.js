/**
 * Guide Navigation System
 * Sidebar, TOC, Prev/Next, Related Content
 */

// ===== GUIDE DATA =====
const GUIDE_CATEGORIES = [
  {
    id: 'revenue',
    label: 'Revenue',
    icon: '\uD83D\uDCC8',
    basePath: '/guides/revenue/',
    guides: [
      { slug: 'hotel-rate-plans.html', title: 'Hotel Rate Plans: EP, CP, MAP, AP' },
      { slug: 'ep-plan-hotel.html', title: 'EP Plan (European Plan)' },
      { slug: 'cp-plan-hotel.html', title: 'CP Plan (Continental Plan)' },
      { slug: 'map-plan-hotel.html', title: 'MAP Plan (Modified American)' },
      { slug: 'ap-plan-hotel.html', title: 'AP Plan (American Plan)' },
      { slug: 'rate-linkage.html', title: 'Rate Linkage (Derived Rates)' },
      { slug: 'revpar.html', title: 'RevPAR' },
      { slug: 'adr.html', title: 'ADR & ARR' },
      { slug: 'occupancy.html', title: 'Occupancy Rate' },
      { slug: 'room-night.html', title: 'Room Night (RN)' },
      { slug: 'mtd-ytd.html', title: 'MTD & YTD Reporting' },
      { slug: 'bar.html', title: 'BAR - Best Available Rate' },
      { slug: 'mlos.html', title: 'MLOS - Minimum Length of Stay' },
      { slug: 'lead-time.html', title: 'Lead Time & Booking Window' },
      { slug: 'no-show.html', title: 'No-Show & Cancellation' },
    ]
  },
  {
    id: 'ota',
    label: 'OTA',
    icon: '\uD83C\uDFE8',
    basePath: '/guides/ota/',
    guides: [
      { slug: 'what-is-ota.html', title: 'What is OTA?' },
      { slug: 'what-is-gds.html', title: 'What is GDS?' },
      { slug: 'best-ota-for-hotels.html', title: 'Best OTA for Hotels' },
      { slug: 'best-ota-for-resorts.html', title: 'Best OTA for Resorts' },
      { slug: 'best-ota-for-homestays.html', title: 'Best OTA for Homestays' },
      { slug: 'booking-com-hotel-listing-guide.html', title: 'Booking.com Listing Guide' },
      { slug: 'booking-genius-program.html', title: 'Booking.com Genius Program' },
      { slug: 'google-free-booking-links.html', title: 'Google Free Booking Links' },
    ]
  },
  {
    id: 'software',
    label: 'Software',
    icon: '\uD83D\uDCBB',
    basePath: '/guides/software/',
    guides: [
      { slug: 'what-is-pms-hotel.html', title: 'What is PMS?' },
      { slug: 'channel-manager.html', title: 'Channel Manager' },
      { slug: 'booking-engine.html', title: 'Booking Engine' },
      { slug: 'what-is-rms-hotel.html', title: 'What is RMS?' },
      { slug: 'what-is-pos-hotel.html', title: 'What is POS?' },
      { slug: 'hotel-inventory-management.html', title: 'Inventory Management' },
      { slug: 'hotel-accounting-software.html', title: 'Accounting Software' },
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '\uD83D\uDCCA',
    basePath: '/guides/reports/',
    guides: [
      { slug: 'manager-report.html', title: 'Manager Report (Flash Report)' },
      { slug: 'night-audit.html', title: 'Night Audit' },
      { slug: 'arrival-report.html', title: 'Arrival Report' },
      { slug: 'departure-report.html', title: 'Departure Report' },
      { slug: 'profit-loss-report.html', title: 'P&L Report' },
      { slug: 'expenses-report.html', title: 'Expenses Report' },
      { slug: 'payment-report.html', title: 'Payment Report' },
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: '\uD83D\uDCCB',
    basePath: '/guides/compliance/',
    guides: [
      { slug: 'gst-hotels.html', title: 'GST for Hotels' },
      { slug: 'tds-tcs.html', title: 'TDS & TCS on OTA Payments' },
      { slug: 'grc-form-c.html', title: 'GRC & Form C' },
    ]
  }
];

// ===== RELATED CONTENT MAP =====
const RELATED_CONTENT = {
  // Revenue
  '/guides/revenue/hotel-rate-plans.html': [
    { href: '/guides/software/booking-engine.html', title: 'Booking Engine', category: 'Software', desc: 'Display rate plans on your website' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync rates across OTAs' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'Tax implications of rate plans' },
  ],
  '/guides/revenue/ep-plan-hotel.html': [
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Manage rate plans in your PMS' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Track rate plan performance' },
  ],
  '/guides/revenue/cp-plan-hotel.html': [
    { href: '/guides/software/what-is-pos-hotel.html', title: 'POS System', category: 'Software', desc: 'Manage breakfast billing' },
    { href: '/guides/reports/expenses-report.html', title: 'Expenses Report', category: 'Reports', desc: 'Track F&B costs' },
  ],
  '/guides/revenue/map-plan-hotel.html': [
    { href: '/guides/software/what-is-pos-hotel.html', title: 'POS System', category: 'Software', desc: 'F&B billing for meal plans' },
    { href: '/guides/software/hotel-inventory-management.html', title: 'Inventory Management', category: 'Software', desc: 'Track F&B ingredients' },
  ],
  '/guides/revenue/ap-plan-hotel.html': [
    { href: '/guides/software/what-is-pos-hotel.html', title: 'POS System', category: 'Software', desc: 'All-inclusive meal tracking' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Profitability of AP plans' },
  ],
  '/guides/revenue/revpar.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Daily RevPAR tracking' },
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Automate pricing decisions' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Revenue to profit analysis' },
  ],
  '/guides/revenue/adr.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Daily ADR tracking' },
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Dynamic pricing' },
  ],
  '/guides/revenue/occupancy.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Daily occupancy tracking' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Manage availability across OTAs' },
  ],
  '/guides/revenue/room-night.html': [
    { href: '/guides/reports/night-audit.html', title: 'Night Audit', category: 'Reports', desc: 'Room night reconciliation' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Room night tracking' },
  ],
  '/guides/revenue/mtd-ytd.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'MTD metrics in daily reports' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Monthly and yearly financials' },
  ],
  '/guides/revenue/bar.html': [
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Dynamic BAR pricing' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Push BAR to all channels' },
  ],
  '/guides/revenue/mlos.html': [
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Automate MLOS restrictions' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync restrictions to OTAs' },
  ],
  '/guides/revenue/lead-time.html': [
    { href: '/guides/software/what-is-rms-hotel.html', title: 'Revenue Management System', category: 'Software', desc: 'Lead time pricing rules' },
    { href: '/guides/reports/arrival-report.html', title: 'Arrival Report', category: 'Reports', desc: 'Track booking patterns' },
  ],
  '/guides/revenue/no-show.html': [
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Track no-show rates' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Guest registration for arrivals' },
  ],
  // Software
  '/guides/software/what-is-pms-hotel.html': [
    { href: '/guides/reports/night-audit.html', title: 'Night Audit', category: 'Reports', desc: 'PMS night audit process' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'GST invoicing from PMS' },
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Track in your PMS' },
  ],
  '/guides/software/channel-manager.html': [
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Push rates to channels' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'Channel performance data' },
  ],
  '/guides/software/booking-engine.html': [
    { href: '/guides/revenue/hotel-rate-plans.html', title: 'Rate Plans', category: 'Revenue', desc: 'Display plans on your site' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'Direct booking tax rules' },
  ],
  '/guides/software/what-is-rms-hotel.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Key metric for RMS' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Base rate for dynamic pricing' },
    { href: '/guides/reports/manager-report.html', title: 'Manager Report', category: 'Reports', desc: 'RMS performance tracking' },
  ],
  '/guides/software/what-is-pos-hotel.html': [
    { href: '/guides/reports/expenses-report.html', title: 'Expenses Report', category: 'Reports', desc: 'F&B cost tracking' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'F&B GST billing' },
  ],
  '/guides/software/hotel-inventory-management.html': [
    { href: '/guides/reports/expenses-report.html', title: 'Expenses Report', category: 'Reports', desc: 'Material cost tracking' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Cost impact on profitability' },
  ],
  '/guides/software/hotel-accounting-software.html': [
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'GST-compliant invoicing' },
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'Tax deduction accounting' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Financial reporting' },
  ],
  // Reports
  '/guides/reports/manager-report.html': [
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Key metric in daily report' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Generate reports from PMS' },
  ],
  '/guides/reports/night-audit.html': [
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Night audit in PMS' },
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'Tax reconciliation' },
  ],
  '/guides/reports/arrival-report.html': [
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Registration for arrivals' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Generate arrival lists' },
  ],
  '/guides/reports/departure-report.html': [
    { href: '/guides/reports/payment-report.html', title: 'Payment Report', category: 'Reports', desc: 'Collect pending payments' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Checkout process' },
  ],
  '/guides/reports/profit-loss-report.html': [
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'Generate P&L statements' },
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Revenue performance' },
  ],
  '/guides/reports/expenses-report.html': [
    { href: '/guides/software/hotel-inventory-management.html', title: 'Inventory Management', category: 'Software', desc: 'Track material costs' },
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'Expense categorization' },
  ],
  '/guides/reports/payment-report.html': [
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'OTA payment deductions' },
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'Payment reconciliation' },
  ],
  // OTA
  '/guides/ota/what-is-ota.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync rates across all OTAs' },
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'Tax deductions on OTA payments' },
    { href: '/guides/revenue/revpar.html', title: 'RevPAR', category: 'Revenue', desc: 'Measure revenue performance' },
  ],
  '/guides/ota/what-is-gds.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'GDS connectivity through CM' },
    { href: '/guides/ota/what-is-ota.html', title: 'What is OTA?', category: 'OTA', desc: 'OTA vs GDS comparison' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Set competitive GDS rates' },
  ],
  '/guides/ota/best-ota-for-hotels.html': [
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Manage all OTAs from one place' },
    { href: '/guides/software/booking-engine.html', title: 'Booking Engine', category: 'Software', desc: 'Reduce OTA dependency' },
    { href: '/guides/revenue/hotel-rate-plans.html', title: 'Rate Plans', category: 'Revenue', desc: 'Set up EP, CP, MAP plans' },
  ],
  '/guides/ota/best-ota-for-resorts.html': [
    { href: '/guides/revenue/mlos.html', title: 'MLOS', category: 'Revenue', desc: 'Minimum stay for peak seasons' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync seasonal pricing' },
    { href: '/guides/revenue/bar.html', title: 'BAR Pricing', category: 'Revenue', desc: 'Dynamic pricing for resorts' },
  ],
  '/guides/ota/best-ota-for-homestays.html': [
    { href: '/guides/compliance/gst-hotels.html', title: 'GST for Hotels', category: 'Compliance', desc: 'GST rules for homestays' },
    { href: '/guides/compliance/grc-form-c.html', title: 'GRC & Form C', category: 'Compliance', desc: 'Guest registration requirements' },
    { href: '/guides/ota/what-is-ota.html', title: 'What is OTA?', category: 'OTA', desc: 'How OTAs work' },
  ],
  '/guides/ota/booking-com-hotel-listing-guide.html': [
    { href: '/guides/revenue/no-show.html', title: 'No-Show & Cancellation', category: 'Revenue', desc: 'Understanding no-show policies' },
    { href: '/guides/software/channel-manager.html', title: 'Channel Manager', category: 'Software', desc: 'Sync availability with Booking.com' },
    { href: '/guides/compliance/tds-tcs.html', title: 'TDS & TCS', category: 'Compliance', desc: 'Tax on Booking.com invoices' },
  ],
  // Compliance
  '/guides/compliance/gst-hotels.html': [
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'GST-compliant invoicing' },
    { href: '/guides/reports/profit-loss-report.html', title: 'P&L Report', category: 'Reports', desc: 'Tax impact on profits' },
  ],
  '/guides/compliance/tds-tcs.html': [
    { href: '/guides/reports/payment-report.html', title: 'Payment Report', category: 'Reports', desc: 'Track TDS/TCS deductions' },
    { href: '/guides/software/hotel-accounting-software.html', title: 'Accounting Software', category: 'Software', desc: 'TDS/TCS accounting' },
  ],
  '/guides/compliance/grc-form-c.html': [
    { href: '/guides/reports/arrival-report.html', title: 'Arrival Report', category: 'Reports', desc: 'Plan guest registration' },
    { href: '/guides/software/what-is-pms-hotel.html', title: 'PMS', category: 'Software', desc: 'Guest profile management' },
  ],
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  var currentPath = window.location.pathname;

  buildSidebar(currentPath);
  setupSidebarToggle();
  setupCategoryToggles();
  generateTOC();
  setupScrollSpy();
  injectPrevNext(currentPath);
  injectRelatedCards(currentPath);
});

// ===== SIDEBAR =====
function buildSidebar(currentPath) {
  var sidebar = document.querySelector('.guide-sidebar');
  if (!sidebar) return;

  var html = '<nav aria-label="Guide navigation">';

  GUIDE_CATEGORIES.forEach(function(cat) {
    var isCurrent = currentPath.indexOf(cat.basePath) === 0;
    var expandedClass = isCurrent ? ' expanded' : '';

    html += '<div class="sidebar-category' + expandedClass + '" data-category="' + cat.id + '">';
    html += '<div class="sidebar-category-header">';
    html += '<span>' + cat.icon + ' ' + cat.label + '</span>';
    html += '<span class="chevron">\u25B8</span>';
    html += '</div>';
    html += '<ul class="sidebar-guide-list">';

    // Category overview link
    var indexActive = (currentPath === cat.basePath || currentPath === cat.basePath + 'index.html') ? ' class="active"' : '';
    html += '<li class="category-overview"><a href="' + cat.basePath + '"' + indexActive + '>Overview</a></li>';

    cat.guides.forEach(function(guide) {
      var href = cat.basePath + guide.slug;
      var isActive = (currentPath.indexOf(guide.slug) !== -1 && currentPath.indexOf(cat.basePath) === 0) ? ' class="active"' : '';
      html += '<li><a href="' + href + '"' + isActive + '>' + guide.title + '</a></li>';
    });

    html += '</ul></div>';
  });

  html += '</nav>';
  sidebar.innerHTML = html;
}

// ===== SIDEBAR TOGGLE (mobile) =====
function setupSidebarToggle() {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('.guide-sidebar');
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

// ===== CATEGORY COLLAPSE/EXPAND =====
function setupCategoryToggles() {
  var headers = document.querySelectorAll('.sidebar-category-header');
  headers.forEach(function(header) {
    header.addEventListener('click', function() {
      header.parentElement.classList.toggle('expanded');
    });
  });
}

// ===== TOC GENERATION =====
function generateTOC() {
  var tocContainer = document.querySelector('.guide-toc');
  if (!tocContainer) return;

  var articleContent = document.querySelector('.article-content');
  if (!articleContent) {
    tocContainer.style.display = 'none';
    var layout = document.querySelector('.guide-page-layout');
    if (layout) layout.classList.remove('has-toc');
    return;
  }

  var headings = articleContent.querySelectorAll('h2');
  if (headings.length < 4) {
    tocContainer.style.display = 'none';
    var layout2 = document.querySelector('.guide-page-layout');
    if (layout2) layout2.classList.remove('has-toc');
    return;
  }

  var html = '<h4>On This Page</h4><ul>';
  headings.forEach(function(h, i) {
    if (!h.id) h.id = 'section-' + i;
    html += '<li><a href="#' + h.id + '" data-toc-target="' + h.id + '">' + h.textContent + '</a></li>';
  });
  html += '</ul>';
  tocContainer.innerHTML = html;
}

// ===== SCROLL SPY =====
function setupScrollSpy() {
  var tocLinks = document.querySelectorAll('.guide-toc a[data-toc-target]');
  if (tocLinks.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        tocLinks.forEach(function(l) { l.classList.remove('active'); });
        var link = document.querySelector('.guide-toc a[data-toc-target="' + entry.target.id + '"]');
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  var headings = document.querySelectorAll('.article-content h2[id]');
  headings.forEach(function(h) { observer.observe(h); });
}

// ===== PREV/NEXT NAVIGATION =====
function injectPrevNext(currentPath) {
  var container = document.querySelector('.prev-next-nav');
  if (!container) return;

  var prevGuide = null;
  var nextGuide = null;

  for (var c = 0; c < GUIDE_CATEGORIES.length; c++) {
    var cat = GUIDE_CATEGORIES[c];
    for (var i = 0; i < cat.guides.length; i++) {
      var guideSlug = cat.guides[i].slug;
      if (currentPath.indexOf(guideSlug) !== -1 && currentPath.indexOf(cat.basePath) === 0) {
        if (i > 0) {
          prevGuide = { title: cat.guides[i - 1].title, href: cat.basePath + cat.guides[i - 1].slug };
        }
        if (i < cat.guides.length - 1) {
          nextGuide = { title: cat.guides[i + 1].title, href: cat.basePath + cat.guides[i + 1].slug };
        }
        break;
      }
    }
    if (prevGuide || nextGuide) break;
  }

  if (!prevGuide && !nextGuide) {
    container.style.display = 'none';
    return;
  }

  var html = '';
  if (prevGuide) {
    html += '<a href="' + prevGuide.href + '" class="prev-next-link prev">';
    html += '<div class="pn-direction">Previous</div>';
    html += '<div class="pn-title">' + prevGuide.title + '</div>';
    html += '</a>';
  } else {
    html += '<div class="prev-next-placeholder"></div>';
  }

  if (nextGuide) {
    html += '<a href="' + nextGuide.href + '" class="prev-next-link next">';
    html += '<div class="pn-direction">Next</div>';
    html += '<div class="pn-title">' + nextGuide.title + '</div>';
    html += '</a>';
  } else {
    html += '<div class="prev-next-placeholder"></div>';
  }

  container.innerHTML = html;
}

// ===== RELATED CONTENT CARDS =====
function injectRelatedCards(currentPath) {
  var container = document.querySelector('.related-cards-section');
  if (!container) return;

  var items = RELATED_CONTENT[currentPath];
  if (!items || items.length === 0) {
    container.style.display = 'none';
    return;
  }

  var html = '<h3>You Might Also Like</h3><div class="related-cards-grid">';
  items.forEach(function(item) {
    html += '<a href="' + item.href + '" class="related-card">';
    html += '<div class="rc-category">' + item.category + '</div>';
    html += '<div class="rc-title">' + item.title + '</div>';
    html += '<div class="rc-desc">' + item.desc + '</div>';
    html += '</a>';
  });
  html += '</div>';
  container.innerHTML = html;
}
