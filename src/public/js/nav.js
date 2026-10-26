/**
 * OnlineHotelier — Shared Site Navigation
 * Injects the sticky nav into any element with id="site-nav".
 * Automatically marks the active link based on current URL.
 */
(function () {
  var NAV_LINKS = [
    { href: '/',          label: 'Home' },
    { href: '/guides/',   label: 'Guides' },
    { href: '/tools/',    label: 'Tools' },
    { href: '/services/', label: 'Services' },
    { href: '/about/',    label: 'About' },
  ];

  // Mega-menu content. Each panel is a set of columns; links carry a one-line
  // description so visitors can pick a destination without opening the index page.
  var MEGA = {
    '/guides/': {
      label: 'Guides',
      all: { href: '/guides/', title: 'Browse all guides', desc: 'Every hotel guide by category' },
      cols: [
        { title: 'Revenue', tag: 'Price smarter', href: '/guides/#revenue', links: [
          { href: '/guides/revenue/revpar.html', label: 'RevPAR' },
          { href: '/guides/revenue/adr.html', label: 'ADR & ARR' },
          { href: '/guides/revenue/hotel-rate-plans.html', label: 'Rate Plans: EP, CP, MAP, AP' },
          { href: '/guides/revenue/increase-hotel-revenue.html', label: 'Increase Revenue' } ] },
        { title: 'OTA', tag: 'Win on channels', href: '/guides/#ota', links: [
          { href: '/guides/ota/best-ota-for-hotels.html', label: 'Best OTA for Hotels' },
          { href: '/guides/ota/makemytrip-commission.html', label: 'MakeMyTrip Commission' },
          { href: '/guides/ota/booking-com-hotel-listing-guide.html', label: 'Booking.com Listing' },
          { href: '/guides/ota/hotel-direct-booking-strategy.html', label: 'Direct Booking Strategy' } ] },
        { title: 'Software', tag: 'Run on tech', href: '/guides/#software', links: [
          { href: '/guides/software/what-is-pms-hotel.html', label: 'What is a PMS?' },
          { href: '/guides/software/channel-manager.html', label: 'Channel Manager' },
          { href: '/guides/software/booking-engine.html', label: 'Booking Engine' },
          { href: '/guides/software/update-hotel-rates-all-otas.html', label: 'Update Rates on All OTAs' } ] },
        { title: 'Reports', tag: 'Know your numbers', href: '/guides/#reports', links: [
          { href: '/guides/reports/night-audit.html', label: 'Night Audit' },
          { href: '/guides/reports/manager-report.html', label: 'Manager Report' },
          { href: '/guides/reports/profit-loss-report.html', label: 'P&L Report' },
          { href: '/guides/reports/arrival-report.html', label: 'Arrival Report' } ] },
        { title: 'Compliance', tag: 'Stay compliant', href: '/guides/#compliance', links: [
          { href: '/guides/compliance/gst-on-hotel-rooms.html', label: 'GST on Hotel Rooms' },
          { href: '/guides/compliance/gst-hotels.html', label: 'Hotel GST Rules' },
          { href: '/guides/compliance/tds-tcs.html', label: 'TDS & TCS on OTA Payments' },
          { href: '/guides/compliance/form-c-hotel.html', label: 'Form C for Hotels' } ] },
        { title: 'Operations', tag: 'Run the floor', href: '/guides/#operations', links: [
          { href: '/guides/operations/hotel-check-in-process.html', label: 'Check-In Process' },
          { href: '/guides/operations/hotel-cancellation-policy.html', label: 'Cancellation Policy' },
          { href: '/guides/operations/hotel-housekeeping-sop.html', label: 'Housekeeping SOP' },
          { href: '/guides/operations/hotel-staff-training.html', label: 'Staff Training' } ] }
      ]
    },
    '/tools/': {
      label: 'Tools',
      all: { href: '/tools/', title: 'Browse all tools', desc: 'Free calculators for Indian hotels' },
      cols: [
        { title: 'Channel costs', tag: 'See what OTAs really cost', href: '/tools/', links: [
          { href: '/tools/ota-commission-calculator/', label: 'OTA Commission Calculator', desc: 'Commission, GST, TDS and TCS breakup' },
          { href: '/tools/ota-dependency-calculator/', label: 'OTA Dependency Calculator', desc: 'Your channel mix and revenue lost' },
          { href: '/tools/guest-acquisition-cost/', label: 'Guest Acquisition Cost', desc: 'OTA vs direct, after all costs' },
          { href: '/tools/hotel-discount-calculator/', label: 'Discount Settlement', desc: 'Real payout after hotel-funded discounts' } ] },
        { title: 'Pricing & demand', tag: 'Set the right rate', href: '/tools/', links: [
          { href: '/tools/rate-shopper/', label: 'Rate Shopper', desc: 'Compare Google Hotels rates live' },
          { href: '/tools/competitor-analysis/', label: 'Competitor Rate Analysis', desc: 'Your price vs nearby hotels' },
          { href: '/tools/demand-calendar/', label: 'Demand Calendar', desc: 'Peak dates across India' },
          { href: '/tools/revenue-management-tool/', label: 'Revenue Management Setup', desc: 'Dynamic pricing slabs for your rooms' } ] },
        { title: 'Profit', tag: 'Know your margin', href: '/tools/', links: [
          { href: '/tools/revenue-profit-estimator/', label: 'Revenue & Profit Estimator', desc: 'Monthly P&L from rooms, occupancy, ADR' },
          { href: '/tools/break-even-calculator/', label: 'Break-Even Calculator', desc: 'Minimum room rate to cover costs' } ] }
      ]
    },
    '/services/': {
      label: 'Services',
      all: { href: '/services/', title: 'All services', desc: 'Hands-on help from OnlineHotelier' },
      cols: [
        { title: 'Software', tag: 'Free to start', href: '/services/', links: [
          { href: '/services/hotel-pms/', label: 'Free Hotel PMS', desc: 'Reservations, billing and taxes for small hotels' } ] },
        { title: 'OTA listing', tag: 'Get found and booked', href: '/services/', links: [
          { href: '/services/independent-hotel-ota-listing/', label: 'Hotel OTA Listing', desc: 'MakeMyTrip, Booking.com and more, set up for you' },
          { href: '/services/vacation-rental-ota-listing/', label: 'Vacation Rental Listing', desc: 'Homestays, villas and apartments on OTAs' } ] },
        { title: 'Review', tag: 'Find what is costing you', href: '/services/', links: [
          { href: '/services/ota-audit/', label: 'Free OTA Listing Audit', desc: 'An expert read of your current listings' } ] }
      ]
    }
  };

  var CSS = `
    #site-nav {
      background: #3E3D35;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    #site-nav .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }
    #site-nav .nav-logo {
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    #site-nav .nav-logo span {
      color: #89826E;
      font-weight: 400;
    }
    #site-nav .nav-links {
      display: flex;
      gap: 0.25rem;
      list-style: none;
      align-items: center;
      margin: 0;
      padding: 0;
    }
    #site-nav .nav-links a {
      text-decoration: none;
      color: rgba(255,255,255,0.65);
      font-weight: 500;
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.2s;
    }
    #site-nav .nav-links a:hover,
    #site-nav .nav-links a.active {
      color: #fff;
      background: rgba(255,255,255,0.08);
    }
    #site-nav .nav-cta {
      background: rgba(137,130,110,0.25) !important;
      color: #fff !important;
      border: 1px solid rgba(137,130,110,0.4) !important;
    }
    #site-nav .nav-cta:hover {
      background: rgba(137,130,110,0.4) !important;
    }
    #site-nav .nav-toggle {
      display: none;
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
      line-height: 1;
    }
    #site-nav .nav-links li { position: static; }
    #site-nav .nav-trigger {
      font: inherit; font-weight: 500; font-size: 0.9rem; cursor: pointer;
      color: rgba(255,255,255,0.65); background: none; border: 0;
      padding: 0.5rem 1rem; border-radius: 6px; transition: all 0.2s;
      display: inline-flex; align-items: center; gap: 0.35rem;
    }
    #site-nav .nav-trigger::after {
      content: ''; width: 6px; height: 6px; margin-top: -3px;
      border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor;
      transform: rotate(45deg); transition: transform 0.2s;
    }
    #site-nav .has-mega.open .nav-trigger::after { transform: rotate(225deg); margin-top: 3px; }
    #site-nav .nav-trigger:hover,
    #site-nav .nav-trigger.active,
    #site-nav .has-mega.open .nav-trigger { color: #fff; background: rgba(255,255,255,0.08); }
    #site-nav .mega {
      display: none; position: absolute; left: 0; right: 0; top: 64px;
      padding: 0 2rem 1.25rem; z-index: 99;
    }
    #site-nav .has-mega.open .mega { display: block; }
    #site-nav .mega-panel {
      max-width: 1200px; margin: 0 auto; background: #F8F8F4; color: #3E3D35;
      border-radius: 0 0 14px 14px; padding: 1.25rem 1.5rem 1.5rem;
      box-shadow: 0 18px 40px rgba(62,61,53,0.22);
      border: 1px solid rgba(62,61,53,0.08); border-top: 0;
    }
    #site-nav .nav-links .mega-all {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      background: #3E3D35; color: #fff; padding: 0.8rem 1.1rem; border-radius: 10px;
      margin-bottom: 1.1rem; max-width: 380px;
    }
    #site-nav .nav-links .mega-all:hover { background: #4a493f; color: #fff; }
    #site-nav .mega-all strong { display: block; font-size: 0.95rem; }
    #site-nav .mega-all small { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.75); margin-top: 2px; font-weight: 400; }
    #site-nav .mega-cols { display: grid; gap: 0.5rem 1.5rem; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); }
    #site-nav .mega-col-head { border-bottom: 1px solid rgba(62,61,53,0.14); padding-bottom: 0.6rem; margin-bottom: 0.4rem; }
    #site-nav .mega-col-head b { display: block; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; color: #3E3D35; }
    #site-nav .mega-col-head span { display: block; font-size: 0.8rem; color: rgba(62,61,53,0.7); margin-top: 2px; }
    #site-nav .mega-col ul { list-style: none; margin: 0; padding: 0; }
    #site-nav .nav-links .mega-col a {
      display: block; padding: 0.45rem 0.5rem; margin: 0 -0.5rem; border-radius: 6px;
      color: #3E3D35; font-size: 0.88rem; font-weight: 500; background: none;
    }
    #site-nav .nav-links .mega-col a:hover { background: rgba(137,130,110,0.12); color: #3E3D35; }
    #site-nav .mega-col a small { display: block; font-size: 0.78rem; font-weight: 400; color: rgba(62,61,53,0.7); margin-top: 1px; }
    #site-nav .nav-links .mega-col .mega-more { font-size: 0.8rem; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
    @media (max-width: 1000px) {
      #site-nav .mega-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 768px) {
      #site-nav .nav-links { max-height: calc(100vh - 64px); overflow-y: auto; }
      #site-nav .nav-trigger { width: 100%; justify-content: space-between; padding: 0.5rem 1rem; }
      #site-nav .mega { position: static; padding: 0; }
      #site-nav .mega-panel { border: 0; box-shadow: none; border-radius: 8px; padding: 0.75rem 1rem; margin: 0.25rem 0 0.5rem; }
      #site-nav .nav-links .mega-all { max-width: none; }
      #site-nav .mega-cols { grid-template-columns: 1fr; gap: 0.75rem; }
    }
    @media (max-width: 768px) {
      #site-nav .nav-toggle { display: block; }
      #site-nav .nav-links {
        display: none;
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        background: #3E3D35;
        flex-direction: column;
        padding: 1rem 2rem 1.5rem;
        gap: 0.25rem;
        border-top: 1px solid rgba(255,255,255,0.08);
        z-index: 99;
      }
      #site-nav .nav-links.open { display: flex; }
    }
  `;

  function inject() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    // Inject CSS once
    if (!document.getElementById('oh-nav-style')) {
      var style = document.createElement('style');
      style.id = 'oh-nav-style';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    var path = window.location.pathname;

    // Determine active link — match longest prefix
    function isActive(href) {
      if (href === '/') return path === '/';
      return path.indexOf(href) === 0;
    }

    function esc(t) { return t.replace(/&/g, '&amp;'); }

    function megaHtml(key, m) {
      var cols = m.cols.map(function (c) {
        var links = c.links.map(function (l) {
          return '<li><a href="' + l.href + '">' + esc(l.label) +
            (l.desc ? '<small>' + esc(l.desc) + '</small>' : '') + '</a></li>';
        }).join('');
        var more = m.cols.length > 3 ? '<li><a class="mega-more" href="' + c.href + '">View all ' + c.title.toLowerCase() + '</a></li>' : '';
        return '<div class="mega-col"><div class="mega-col-head"><b>' + c.title + '</b><span>' + c.tag + '</span></div><ul>' + links + more + '</ul></div>';
      }).join('');
      var id = 'oh-mega-' + key.replace(/\//g, '');
      return '<li class="has-mega">' +
        '<button type="button" class="nav-trigger' + (isActive(key) ? ' active' : '') + '" aria-expanded="false" aria-controls="' + id + '">' + m.label + '</button>' +
        '<div class="mega" id="' + id + '"><div class="mega-panel">' +
          '<a class="mega-all" href="' + m.all.href + '"><span><strong>' + m.all.title + '</strong><small>' + m.all.desc + '</small></span><span aria-hidden="true">&rarr;</span></a>' +
          '<div class="mega-cols" style="--cols:' + m.cols.length + '">' + cols + '</div>' +
        '</div></div></li>';
    }

    var linksHtml = NAV_LINKS.map(function (link) {
      if (MEGA[link.href]) return megaHtml(link.href, MEGA[link.href]);
      var active = isActive(link.href) ? ' class="active"' : '';
      return '<li><a href="' + link.href + '"' + active + '>' + link.label + '</a></li>';
    }).join('');

    linksHtml += '<li><a href="https://hms.onlinehotelier.com/login">PMS Login</a></li>';
    linksHtml += '<li><a href="/contact/" class="nav-cta">Contact Us</a></li>';

    nav.innerHTML =
      '<div class="nav-container">' +
        '<a href="/" class="nav-logo">OnlineHotelier</a>' +
        '<button class="nav-toggle" id="oh-nav-toggle" aria-label="Toggle menu">&#9776;</button>' +
        '<ul class="nav-links" id="oh-nav-links">' + linksHtml + '</ul>' +
      '</div>';

    document.getElementById('oh-nav-toggle').addEventListener('click', function () {
      document.getElementById('oh-nav-links').classList.toggle('open');
    });

    // Mega menus: hover (mouse), click/tap, keyboard. One open at a time.
    var items = nav.querySelectorAll('.has-mega');
    var closeTimer;
    function setOpen(li, open) {
      li.classList.toggle('open', open);
      li.querySelector('.nav-trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function closeAll(except) {
      Array.prototype.forEach.call(items, function (li) { if (li !== except) setOpen(li, false); });
    }
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 769px)');
    Array.prototype.forEach.call(items, function (li) {
      li.querySelector('.nav-trigger').addEventListener('click', function () {
        var open = !li.classList.contains('open');
        closeAll(li);
        setOpen(li, open);
      });
      li.addEventListener('mouseenter', function () {
        if (!canHover || !canHover.matches) return;
        clearTimeout(closeTimer);
        closeAll(li);
        setOpen(li, true);
      });
      li.addEventListener('mouseleave', function () {
        if (!canHover || !canHover.matches) return;
        closeTimer = setTimeout(function () { setOpen(li, false); }, 150);
      });
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openLi = nav.querySelector('.has-mega.open');
      if (openLi) { setOpen(openLi, false); openLi.querySelector('.nav-trigger').focus(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
