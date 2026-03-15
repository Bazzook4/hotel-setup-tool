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

    var linksHtml = NAV_LINKS.map(function (link) {
      var active = isActive(link.href) ? ' class="active"' : '';
      return '<li><a href="' + link.href + '"' + active + '>' + link.label + '</a></li>';
    }).join('');

    linksHtml += '<li><a href="https://www.onlinehotelier.com/contact" class="nav-cta" target="_blank" rel="noopener">Contact Us</a></li>';

    nav.innerHTML =
      '<div class="nav-container">' +
        '<a href="/" class="nav-logo">OnlineHotelier <span>Insights</span></a>' +
        '<button class="nav-toggle" id="oh-nav-toggle" aria-label="Toggle menu">&#9776;</button>' +
        '<ul class="nav-links" id="oh-nav-links">' + linksHtml + '</ul>' +
      '</div>';

    document.getElementById('oh-nav-toggle').addEventListener('click', function () {
      document.getElementById('oh-nav-links').classList.toggle('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
