## 1. AI Crawler Meta Tags (immediately after the `<link rel="canonical">`)

```html
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
```

All three tags are required on **every** indexable page, not just guides: that
includes category index pages, `/tools/`, `/services/`, `/about/`, `/contact/`,
`/privacy/` and the homepage. Use the exact directive order above so a grep for
the full string finds every compliant page in one pass.

The only pages that must NOT carry them are the four `/samples/` client
demos, which stay `noindex` and are also blocked in `robots.txt`.

## 2. Organization Schema (after Article schema)

```json
{"@context":"https://schema.org","@type":"Organization","name":"OnlineHotelier","url":"https://www.onlinehotelier.com","logo":"https://www.onlinehotelier.com/favicon.png","sameAs":["https://www.onlinehotelier.com"]}
```

## 3. BreadcrumbList Schema

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://www.onlinehotelier.com/"},
  {"@type":"ListItem","position":2,"name":"Guides","item":"https://www.onlinehotelier.com/guides/"},
  {"@type":"ListItem","position":3,"name":"[Category]","item":"https://www.onlinehotelier.com/guides/[category]/"},
  {"@type":"ListItem","position":4,"name":"[Page Title]","item":"[Full URL]"}
]}
```

## 4. H2 ID Attributes

All H2 headings must have semantic IDs for deep linking: `<h2 id="section-slug">Title</h2>`
