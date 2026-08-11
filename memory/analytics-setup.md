# Analytics Setup

Set up 9–11 August 2026, after the domain migration.

## GA4 property

**`G-9L2N1S6S9F`** — the only property the site uses. Hardcoded in all 89 pages.

Two older properties were removed: `G-Q2BPYRGZTM` (was on all 89 pages) and
`G-MKV3LKQJW1` (was on 69). Both were firing at once, so 69 pages double-counted
every visit. Their historical data still exists in those properties but is not
carried into `G-9L2N1S6S9F`, which starts from 9 August 2026.

**GTM container `GTM-N9WS6GD` is deliberately NOT installed.** It is configured to
feed `G-9L2N1S6S9F` plus Google Ads `AW-10871918468`, but the site is static HTML
with no build step and there are no Ads campaigns, so a tag container adds a
dependency without solving anything. Revisit only if Google Ads starts.

Note: the data stream URL is set to `https://onlinehotelier.com` without `www`,
while the site serves from `www.onlinehotelier.com`. Harmless for collection but
worth correcting in stream settings.

## whatsapp_click event

WhatsApp is the primary conversion. Before this, no custom events existed at all,
so enquiries were invisible in Analytics.

Fires from `src/public/js/wa-widget.js` (site-wide floating widget) and
`src/public/contact/index.html` (contact page). Marked as a key event in GA4.

Each event carries three parameters, registered as Event-scoped custom dimensions:

| Dimension | Parameter | What it answers |
|---|---|---|
| WA Action | `wa_action` | Which button: `widget_open`, `widget_form`, `contact_form`, `contact_direct` |
| WA Service | `wa_service` | Which service they picked in the dropdown, blank if none |
| WA Page | `page_path` | Which page they were reading when they clicked |

**WA Page is the one that matters.** It answers whether the 57 guides produce
enquiries or only readers — the evidence needed before investing further in the
guides-to-services wiring described in [[guides-to-services-map]].

**WA Action** compares `widget_open` against `widget_form`: a large gap means people
open the widget and abandon the form.

Custom dimensions only collect from creation onward, so the first 6 clicks
(9–10 Aug) have no breakdown.

## Reading the data

- Use **Reports → Realtime** to check the tag is firing. **DebugView shows nothing
  unless the browser is explicitly in debug mode** — it is not a live feed of all
  traffic, which is easy to misread as broken tracking.
- Treat **9 August 2026** as day one for this property. Anything earlier in the
  chart is other properties bleeding in.
- `generate_lead` and `form_start` are GA4 enhanced-measurement defaults, not ours.
  Do not count them as enquiries.

## Google Analytics MCP

`https://github.com/googleanalytics/google-analytics-mcp` — read-only MCP server for
querying GA4 from Claude Code. Worth installing around late August 2026, once there
is enough conversion data to make queries meaningful. Marked experimental by Google.

Related: [[migration-plan]], [[guides-to-services-map]], [[brand-positioning]]
