// Public software directory: /software/, /software/<category>/,
// /software/vendor/<company>/ and /software/sitemap.xml.
//
// Rendered on the server so every listing and internal link is in the served
// HTML (memory/crawlable-static-links.md). vercel.json rewrites the public
// URLs to this function; src/server.js mounts it for local dev.
//
// Data is vendor-configured in Supabase (supabase/migrations/001_marketplace.sql)
// and read with the publishable key, so RLS limits it to approved listings.
// Editorial copy per category lives in ./_lib/software-content.js.

import { CATEGORY_CONTENT, HOME_CONTENT } from './_lib/software-content.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gnqlvwpyoorwhmkvoeak.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_JhP26eAdpdM2GMbfaZHuyA_J-q9MAfk';
const SITE = 'https://www.onlinehotelier.com';

// A category page (and the directory home, counted across all vendors) stays
// noindex and out of the sitemap until it lists this many vendors, so an
// empty or near-empty list never gets indexed as thin content.
const INDEX_THRESHOLD = 5;

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// The categories the team is building out first. Shown as "Start here" on
// the landing page; everything else sits under "More categories".
const PRIORITY_CATEGORIES = ['channel-manager', 'property-management-system', 'booking-engine', 'revenue-management'];

// OnlineHotelier is the mediator: the main call to action on every page is a
// conversation with the team, on the same WhatsApp line as /js/wa-widget.js.
const WHATSAPP_PHONE = '918591756934';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

const LIST_FIELDS = 'id,slug,name,tagline,logo_path,updated_at,company_services(category_id,description)';

async function loadDirectory() {
  const [categories, companies] = await Promise.all([
    rest('categories?select=id,slug,name,sort_order&order=sort_order'),
    rest(`companies?select=${LIST_FIELDS}&status=eq.approved&order=name`),
  ]);
  const byCategory = new Map(categories.map((c) => [c.id, []]));
  for (const co of companies) {
    for (const s of co.company_services) byCategory.get(s.category_id)?.push({ ...co, serviceDescription: s.description });
  }
  return { categories, companies, byCategory };
}

async function loadVendor(slug) {
  const rows = await rest(
    'companies?select=id,slug,name,tagline,description,website_url,headquarters,founded_year,logo_path,updated_at,' +
    'company_services(category_id,description),company_screenshots(path,caption,sort_order)' +
    `&status=eq.approved&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Vendor text is plain text: escape it, then keep their paragraph breaks.
function paragraphs(text) {
  return String(text || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function imageUrl(path) {
  return path ? `${SUPABASE_URL}/storage/v1/object/public/marketplace/${path.split('/').map(encodeURIComponent).join('/')}` : '';
}

function initials(name) {
  return String(name).split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
}

function logo(co, size = 'md') {
  return co.logo_path
    ? `<img class="sw-logo sw-logo-${size}" src="${esc(imageUrl(co.logo_path))}" alt="${esc(co.name)} logo" loading="lazy" width="64" height="64">`
    : `<span class="sw-logo sw-logo-${size} sw-logo-fallback" aria-hidden="true">${esc(initials(co.name))}</span>`;
}

function jsonLd(obj) {
  // </script> inside vendor text must not end the block early.
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + url })),
  };
}

const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'OnlineHotelier',
  url: SITE + '/',
  logo: SITE + '/favicon.png',
};

function categoryLabel(cat) {
  return CATEGORY_CONTENT[cat.slug]?.shortName || cat.name;
}

function whatsappUrl(message) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

// The "talk to OnlineHotelier" block. `context` feeds both the pre-filled
// message and the GA4 whatsapp_click event.
function helpCta({ heading, body, message, context }) {
  return `
    <aside class="sw-help">
      <div>
        <div class="sw-help-eyebrow">Not sure which one fits?</div>
        <div class="sw-help-title">${esc(heading)}</div>
        <p>${esc(body)}</p>
      </div>
      <a class="sw-help-btn" href="${esc(whatsappUrl(message))}" target="_blank" rel="noopener" data-wa-context="${esc(context)}">Talk to OnlineHotelier &rarr;</a>
    </aside>`;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function page({ title, description, path, indexable, ogImage, schema = [], breadcrumbs, body }) {
  const robots = indexable
    ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    : 'noindex, follow';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-9L2N1S6S9F"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-9L2N1S6S9F');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${path}">
  <meta name="robots" content="${robots}">
  <meta name="googlebot" content="${robots}">
  <meta name="bingbot" content="${robots}">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta property="og:title" content="${esc(title.replace(/ \| OnlineHotelier$/, ''))}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}${path}">
  <meta property="og:image" content="${esc(ogImage || SITE + '/og-image.png')}">
  <!-- Google AdSense -->
  <meta name="google-adsense-account" content="ca-pub-6118286051054894">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6118286051054894" crossorigin="anonymous"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/software.css">
  <link rel="stylesheet" href="/css/footer.css">
  ${schema.map(jsonLd).join('\n  ')}
</head>
<body>
  <nav id="site-nav"></nav>
  <nav class="sw-breadcrumb" aria-label="Breadcrumb">
    ${breadcrumbs.map(([name, url], i) => (i === breadcrumbs.length - 1
      ? `<span aria-current="page">${esc(name)}</span>`
      : `<a href="${url}">${esc(name)}</a> <span class="sep">›</span> `)).join('')}
  </nav>
  <main class="sw-main">
${body}
  </main>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <h4>OnlineHotelier</h4>
        <p>We help Indian hoteliers find their way through the digital side of the business. Free guides, free tools, and hands-on help when you want it. Built from 8+ years of real-world hospitality experience.</p>
      </div>
      <div>
        <h5>Learn</h5>
        <ul>
          <li><a href="/guides/ota/">OTA Guides</a></li>
          <li><a href="/guides/revenue/">Revenue Guides</a></li>
          <li><a href="/guides/software/">Software Guides</a></li>
          <li><a href="/guides/">All Guides</a></li>
        </ul>
      </div>
      <div>
        <h5>Free Tools</h5>
        <ul>
          <li><a href="/tools/ota-commission-calculator/">Commission Calculator</a></li>
          <li><a href="/tools/ota-dependency-calculator/">OTA Dependency</a></li>
          <li><a href="/tools/break-even-calculator/">Break-Even Calculator</a></li>
          <li><a href="/tools/">All Tools</a></li>
        </ul>
      </div>
      <div>
        <h5>Work With Us</h5>
        <ul>
          <li><a href="/services/">All Services</a></li>
          <li><a href="/services/hotel-pms/">Free Hotel PMS</a></li>
          <li><a href="/about/">About Us</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="/privacy/">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 OnlineHotelier. All rights reserved.</p>
      <a href="/">www.onlinehotelier.com</a>
    </div>
  </footer>

  <script src="/js/nav.js"></script>
  <script>
    // Outbound vendor clicks are the section's conversion: count them.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-vendor-click]');
      if (a && window.gtag) gtag('event', 'vendor_website_click', { vendor: a.dataset.vendorClick, page_path: location.pathname });
      var w = e.target.closest && e.target.closest('a[data-wa-context]');
      if (w && window.gtag) gtag('event', 'whatsapp_click', { source: 'software_directory', context: w.dataset.waContext, page_path: location.pathname });
    });
  </script>
</body>
</html>`;
}

function listCta() {
  return `
    <aside class="sw-cta">
      <div>
        <div class="sw-cta-eyebrow">For software companies</div>
        <div class="sw-cta-title">List your hotel software here</div>
        <p>Add your logo, services and screenshots. Listing is free and reviewed by the OnlineHotelier team before it goes live.</p>
      </div>
      <a class="sw-cta-btn" href="/vendor/">List your software &rarr;</a>
    </aside>`;
}

function faqBlock(faqs) {
  if (!faqs?.length) return '';
  return `
    <section class="sw-section" id="faq">
      <h2>Frequently Asked Questions</h2>
      ${faqs.map((f) => `<details class="sw-faq"><summary>${esc(f.q)}</summary><div>${f.a}</div></details>`).join('')}
    </section>`;
}

function faqLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
    })),
  };
}

function vendorCard(co, categoriesById, { serviceDescription } = {}) {
  const chips = co.company_services
    .map((s) => categoriesById.get(s.category_id)).filter(Boolean)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((cat) => `<span class="sw-chip">${esc(categoryLabel(cat))}</span>`).join('');
  return `
      <article class="sw-card">
        <a class="sw-card-link" href="/software/vendor/${esc(co.slug)}/">
          <div class="sw-card-head">
            ${logo(co)}
            <div>
              <h3>${esc(co.name)}</h3>
              ${co.tagline ? `<p class="sw-tagline">${esc(co.tagline)}</p>` : ''}
            </div>
          </div>
          ${serviceDescription ? `<p class="sw-card-desc">${esc(serviceDescription)}</p>` : ''}
          <div class="sw-chips">${chips}</div>
          <span class="sw-card-more">View profile &rarr;</span>
        </a>
      </article>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function renderHome({ categories, companies, byCategory }) {
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const c = HOME_CONTENT;
  const recent = [...companies].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6);
  const priority = PRIORITY_CATEGORIES.map((slug) => categories.find((cat) => cat.slug === slug)).filter(Boolean);
  const rest = categories.filter((cat) => !PRIORITY_CATEGORIES.includes(cat.slug));
  const count = (cat) => {
    const n = byCategory.get(cat.id).length;
    return n ? `${n} ${n === 1 ? 'vendor' : 'vendors'}` : 'Vendors coming soon';
  };

  const body = `
    <header class="sw-hero sw-hero-home">
      <h1>${esc(c.h1)}</h1>
      <div class="sw-intro">${c.intro}</div>
      <div class="sw-hero-actions">
        <a class="sw-btn" href="#categories">Browse software</a>
        <a class="sw-btn sw-btn-ghost" href="${esc(whatsappUrl('Hi OnlineHotelier, I need help choosing hotel software for my property.'))}" target="_blank" rel="noopener" data-wa-context="home_hero">Get help choosing</a>
      </div>
    </header>

    <section class="sw-section" id="categories">
      <h2>${esc(c.categoriesHeading || 'Start Here: The Core Hotel Systems')}</h2>
      <div class="sw-cat-grid sw-cat-grid-priority">
        ${priority.map((cat) => `<a class="sw-cat sw-cat-priority" href="/software/${esc(cat.slug)}/">
          <span class="sw-cat-name">${esc(categoryLabel(cat))}</span>
          ${CATEGORY_CONTENT[cat.slug]?.blurb ? `<span class="sw-cat-blurb">${esc(CATEGORY_CONTENT[cat.slug].blurb)}</span>` : ''}
          <span class="sw-cat-count">${count(cat)}</span>
        </a>`).join('\n        ')}
      </div>
      ${rest.length ? `
      <h3 class="sw-subhead">More categories</h3>
      <div class="sw-cat-grid">
        ${rest.map((cat) => `<a class="sw-cat" href="/software/${esc(cat.slug)}/">
          <span class="sw-cat-name">${esc(categoryLabel(cat))}</span>
          <span class="sw-cat-count">${count(cat)}</span>
        </a>`).join('\n        ')}
      </div>` : ''}
    </section>

    <section class="sw-section" id="how-it-works">
      <h2>${esc(c.howHeading || 'How the Marketplace Works')}</h2>
      <ol class="sw-steps">
        ${(c.steps || [
          { title: 'Browse by category', text: 'See which software companies serve Indian hotels in each category.' },
          { title: 'Compare what each offers', text: 'Every listing shows the services, screenshots and company details the vendor provides.' },
          { title: 'Ask us before you commit', text: 'Tell us about your property and we help you shortlist, question vendors and avoid a costly switch later.' },
        ]).map((st) => `<li><strong>${esc(st.title)}</strong><span>${esc(st.text)}</span></li>`).join('')}
      </ol>
    </section>

    ${companies.length ? `
    <section class="sw-section" id="vendors">
      <h2>Recently Updated Vendors</h2>
      <div class="sw-grid">${recent.map((co) => vendorCard(co, categoriesById)).join('')}</div>
      ${companies.length > recent.length ? `
      <h3 class="sw-subhead">All vendors</h3>
      <ul class="sw-all">${companies.map((co) => `<li><a href="/software/vendor/${esc(co.slug)}/">${esc(co.name)}</a></li>`).join('')}</ul>` : ''}
    </section>` : ''}

    ${helpCta({
      heading: 'Tell us about your hotel and we will help you shortlist',
      body: 'Rooms, OTAs you sell on, what your current system gets wrong. We will point you to the options worth a demo and the questions to ask.',
      message: 'Hi OnlineHotelier, I need help choosing hotel software. My property: ',
      context: 'home',
    })}

    ${(c.sections || []).map((s) => `
    <section class="sw-section" id="${esc(s.id)}">
      <h2>${esc(s.h2)}</h2>
      ${s.html}
    </section>`).join('')}

    ${faqBlock(c.faqs)}

    ${listCta()}`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Hotel software categories',
      itemListElement: categories.map((cat, i) => ({
        '@type': 'ListItem', position: i + 1, name: cat.name, url: `${SITE}/software/${cat.slug}/`,
      })),
    },
    breadcrumbLd([['Home', '/'], ['Software', '/software/']]),
    ORG_LD,
  ];
  if (c.faqs?.length) schema.push(faqLd(c.faqs));

  return page({
    title: c.title,
    description: c.description,
    path: '/software/',
    indexable: companies.length >= INDEX_THRESHOLD,
    breadcrumbs: [['Home', '/'], ['Software', '/software/']],
    schema,
    body,
  });
}

function renderCategory(cat, { categories, byCategory }) {
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const vendors = byCategory.get(cat.id);
  const c = CATEGORY_CONTENT[cat.slug] || {};
  const name = categoryLabel(cat);
  const path = `/software/${cat.slug}/`;
  const others = categories.filter((o) => o.id !== cat.id);
  const crumbs = [['Home', '/'], ['Software', '/software/'], [name, path]];

  const body = `
    <header class="sw-hero">
      <h1>${esc(c.h1 || `${cat.name} for Hotels in India`)}</h1>
      ${c.intro ? `<div class="sw-intro">${c.intro}</div>` : ''}
    </header>

    ${c.whatIs ? `
    <section class="sw-section" id="what-is">
      <h2>${esc(c.whatIsHeading || `What Is ${name}?`)}</h2>
      ${c.whatIs}
      ${c.guide ? `<p><a class="sw-guide-link" href="${esc(c.guide.href)}">${esc(c.guide.anchor)} &rarr;</a></p>` : ''}
    </section>` : ''}

    <section class="sw-section" id="vendors">
      <h2>${esc(c.vendorsHeading || `${name} Vendors for Indian Hotels`)}</h2>
      ${vendors.length
        ? `<p class="sw-note">Listings and service descriptions are written by each vendor. OnlineHotelier reviews them before they go live but does not test or endorse the software.</p>
      <div class="sw-grid">${vendors.map((co) => vendorCard(co, categoriesById, { serviceDescription: co.serviceDescription })).join('')}</div>`
        : `<div class="sw-empty">
        <p><strong>No ${esc(name)} vendors are listed yet.</strong> We are adding vendors now. If you build ${esc(name.toLowerCase())} software for Indian hotels, you can list it for free.</p>
        <a class="sw-btn" href="/vendor/">List your software &rarr;</a>
      </div>`}
    </section>

    ${c.lookFor ? `
    <section class="sw-section" id="buying-guide">
      <h2>${esc(c.lookForHeading || 'What to Look For')}</h2>
      ${c.lookFor}
    </section>` : ''}

    ${helpCta({
      heading: `Comparing ${name} options? Ask us first`,
      body: 'Tell us your room count, OTAs and current setup. We will help you shortlist and tell you what to check in the demo.',
      message: `Hi OnlineHotelier, I need help choosing ${cat.name}. My property: `,
      context: `category_${cat.slug}`,
    })}

    ${faqBlock(c.faqs)}

    <section class="sw-section" id="other-categories">
      <h2>Other Hotel Software Categories</h2>
      <ul class="sw-other">${others.map((o) => `<li><a href="/software/${esc(o.slug)}/">${esc(categoryLabel(o))}</a></li>`).join('')}</ul>
    </section>

    ${listCta()}`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${cat.name} vendors for hotels in India`,
      itemListElement: vendors.map((co, i) => ({
        '@type': 'ListItem', position: i + 1, name: co.name, url: `${SITE}/software/vendor/${co.slug}/`,
      })),
    },
    breadcrumbLd(crumbs),
    ORG_LD,
  ];
  if (c.faqs?.length) schema.push(faqLd(c.faqs));

  return page({
    title: c.title || `${cat.name} for Hotels in India | OnlineHotelier`,
    description: c.description || `Compare ${cat.name.toLowerCase()} vendors for Indian hotels on OnlineHotelier.`,
    path,
    indexable: vendors.length >= INDEX_THRESHOLD,
    breadcrumbs: crumbs,
    schema,
    body,
  });
}

function renderVendor(co, categories) {
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const services = co.company_services
    .map((s) => ({ ...s, cat: categoriesById.get(s.category_id) })).filter((s) => s.cat)
    .sort((a, b) => a.cat.sort_order - b.cat.sort_order);
  const shots = [...co.company_screenshots].sort((a, b) => a.sort_order - b.sort_order);
  const path = `/software/vendor/${co.slug}/`;
  const primary = services[0]?.cat;
  const crumbs = [['Home', '/'], ['Software', '/software/']];
  if (primary) crumbs.push([categoryLabel(primary), `/software/${primary.slug}/`]);
  crumbs.push([co.name, path]);

  const serviceNames = services.map((s) => categoryLabel(s.cat));
  const title = `${co.name}: ${serviceNames.slice(0, 2).join(' & ') || 'Hotel Software'} for Hotels | OnlineHotelier`;
  const description = (co.tagline
    ? `${co.tagline}. `
    : `${co.name} hotel software for Indian properties. `)
    + `See ${co.name}'s services${shots.length ? ', screenshots' : ''} and company details on OnlineHotelier.`;

  const facts = [
    co.headquarters && ['Headquarters', esc(co.headquarters)],
    co.founded_year && ['Founded', esc(co.founded_year)],
    co.website_url && ['Website', `<a href="${esc(co.website_url)}" target="_blank" rel="nofollow noopener" data-vendor-click="${esc(co.slug)}">${esc(co.website_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`],
    serviceNames.length && ['Categories', esc(serviceNames.join(', '))],
  ].filter(Boolean);

  const body = `
    <header class="sw-profile-head">
      ${logo(co, 'lg')}
      <div class="sw-profile-title">
        <h1>${esc(co.name)}</h1>
        ${co.tagline ? `<p class="sw-tagline">${esc(co.tagline)}</p>` : ''}
        <div class="sw-chips">${services.map((s) => `<a class="sw-chip" href="/software/${esc(s.cat.slug)}/">${esc(categoryLabel(s.cat))}</a>`).join('')}</div>
      </div>
      <div class="sw-profile-actions">
        <a class="sw-btn" href="${esc(whatsappUrl(`Hi OnlineHotelier, I am looking at ${co.name} and would like your advice. My property: `))}" target="_blank" rel="noopener" data-wa-context="vendor_${esc(co.slug)}">Ask us about ${esc(co.name)}</a>
        ${co.website_url ? `<a class="sw-link" href="${esc(co.website_url)}" target="_blank" rel="nofollow noopener" data-vendor-click="${esc(co.slug)}">Vendor website &#8599;</a>` : ''}
      </div>
    </header>

    <div class="sw-profile">
      <div class="sw-profile-main">
        ${co.description ? `
        <section class="sw-section" id="overview">
          <h2>What ${esc(co.name)} Does</h2>
          ${paragraphs(co.description)}
        </section>` : ''}

        ${services.length ? `
        <section class="sw-section" id="services">
          <h2>Services &amp; Modules</h2>
          ${services.map((s) => `
          <div class="sw-service">
            <h3><a href="/software/${esc(s.cat.slug)}/">${esc(s.cat.name)}</a></h3>
            ${s.description ? `<p>${esc(s.description)}</p>` : ''}
          </div>`).join('')}
        </section>` : ''}

        ${shots.length ? `
        <section class="sw-section" id="screenshots">
          <h2>Screenshots</h2>
          <div class="sw-shots">
            ${shots.map((s, i) => `
            <figure>
              <a href="${esc(imageUrl(s.path))}" target="_blank" rel="noopener">
                <img src="${esc(imageUrl(s.path))}" alt="${esc(s.caption || `${co.name} screenshot ${i + 1}`)}" loading="lazy">
              </a>
              ${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}
            </figure>`).join('')}
          </div>
        </section>` : ''}
      </div>

      <aside class="sw-profile-side">
        <section class="sw-facts" id="about">
          <h2>About ${esc(co.name)}</h2>
          <dl>${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
        </section>
        <p class="sw-note">This listing is provided by ${esc(co.name)} and reviewed by the OnlineHotelier team before publishing. OnlineHotelier does not test or endorse the software. Last updated ${new Date(co.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
      </aside>
    </div>

    ${helpCta({
      heading: `Considering ${co.name}?`,
      body: 'Tell us about your property and we will tell you what to check before you sign, and what else is worth a look.',
      message: `Hi OnlineHotelier, I am considering ${co.name}. My property: `,
      context: `vendor_${co.slug}`,
    })}

    ${listCta()}`;

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: co.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: serviceNames.join(', ') || undefined,
    operatingSystem: 'Web',
    description: co.tagline || undefined,
    url: co.website_url || undefined,
    image: co.logo_path ? imageUrl(co.logo_path) : undefined,
    screenshot: shots.length ? shots.map((s) => imageUrl(s.path)) : undefined,
    publisher: {
      '@type': 'Organization',
      name: co.name,
      url: co.website_url || undefined,
      logo: co.logo_path ? imageUrl(co.logo_path) : undefined,
      foundingDate: co.founded_year ? String(co.founded_year) : undefined,
      address: co.headquarters || undefined,
    },
  };

  return page({
    title,
    description,
    path,
    indexable: true,
    ogImage: co.logo_path ? imageUrl(co.logo_path) : null,
    breadcrumbs: crumbs,
    schema: [software, breadcrumbLd(crumbs), ORG_LD],
    body,
  });
}

function renderNotFound() {
  return page({
    title: 'Software Not Found | OnlineHotelier',
    description: 'This software listing is not available.',
    path: '/software/',
    indexable: false,
    breadcrumbs: [['Home', '/'], ['Software', '/software/']],
    body: `
    <header class="sw-hero">
      <h1>Listing not found</h1>
      <p>This listing does not exist or is no longer published.</p>
      <p><a class="sw-btn" href="/software/">Browse all hotel software &rarr;</a></p>
    </header>`,
  });
}

function renderSitemap({ categories, companies, byCategory }) {
  const urls = [];
  const lastmod = (list) => list.map((c) => c.updated_at).sort().pop()?.slice(0, 10);
  if (companies.length >= INDEX_THRESHOLD) urls.push(['/software/', lastmod(companies)]);
  for (const cat of categories) {
    const vendors = byCategory.get(cat.id);
    if (vendors.length >= INDEX_THRESHOLD) urls.push([`/software/${cat.slug}/`, lastmod(vendors)]);
  }
  for (const co of companies) urls.push([`/software/vendor/${co.slug}/`, co.updated_at.slice(0, 10)]);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${SITE}${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  const route = String(req.query.route || 'home');
  const slug = String(req.query.slug || '');
  const send = (status, type, bodyText, maxAge = 300) => {
    res.statusCode = status;
    res.setHeader('Content-Type', type);
    // Vendor edits show within five minutes; the CDN keeps serving the last
    // good copy while it refreshes.
    res.setHeader('Cache-Control', status === 200
      ? `public, s-maxage=${maxAge}, stale-while-revalidate=86400`
      : 'public, s-maxage=60');
    res.end(bodyText);
  };

  try {
    if (slug && !SLUG_RE.test(slug)) return send(404, 'text/html; charset=utf-8', renderNotFound());

    if (route === 'vendor') {
      const [co, categories] = await Promise.all([
        loadVendor(slug),
        rest('categories?select=id,slug,name,sort_order&order=sort_order'),
      ]);
      return co
        ? send(200, 'text/html; charset=utf-8', renderVendor(co, categories))
        : send(404, 'text/html; charset=utf-8', renderNotFound());
    }

    const data = await loadDirectory();
    if (route === 'sitemap') return send(200, 'application/xml; charset=utf-8', renderSitemap(data), 3600);
    if (route === 'category') {
      const cat = data.categories.find((c) => c.slug === slug);
      return cat
        ? send(200, 'text/html; charset=utf-8', renderCategory(cat, data))
        : send(404, 'text/html; charset=utf-8', renderNotFound());
    }
    return send(200, 'text/html; charset=utf-8', renderHome(data));
  } catch (err) {
    console.error('software directory:', err);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '60');
    return res.end('The software directory is temporarily unavailable. Please try again in a minute.');
  }
}
