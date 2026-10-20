# OnlineHotelier Admin — Architecture

Status: **v1 built 20 Oct 2026** (CRM, lead capture, page tracker). Google data is still design only. Drafted 20 Oct 2026. Revised the same
day to add login and a leads CRM, to build on Supabase, and to serve it at
`www.onlinehotelier.com/admin/`.

A private, login-protected admin area at **`/admin/`** that shares one Supabase
database.

## Scope for v1 (decided 20 Oct 2026)

Only two things are built now:

1. **Leads CRM.** Every enquiry from the site, with the page it came from,
   followed through to won or lost (§6).
2. **Page tracker.** Every page on the site, what was added or changed and when,
   and its status: is it live, is the live copy the latest version, is it listed
   where it should be, and does it pass the page template checks (§8, §9).

**Deferred, not dropped:** Search Console and GA4 numbers, keyword tracking,
Google index status, and before/after impact of changes. They are kept in §8.5
and §9.5 so the tables above do not need reworking when they come. None of v1
needs a Google account or API key.

---

## 1. Constraints from the current setup

| Fact | Consequence for the design |
|---|---|
| Everything under `src/public/` is served publicly | The admin pages in `src/public/admin/` are reachable by anyone, so they hold **no data and no secret**: an empty shell that loads data only after login. Protection is Supabase RLS, never the URL being hard to find. |
| `/admin/` shares the `www` origin with ~90 public pages that run GA4's third-party script | Any script on a public page can read `localStorage` for the whole origin. The login token is therefore never put in browser storage (§5). |
| The public site is static, and Vercel functions have no persistent disk | Data lives in Supabase Postgres. |
| Enquiries go straight to WhatsApp (`wa-widget.js`, `contact/index.html`) and are never stored | The CRM needs a small capture step when the visitor clicks Send (§6.1). |
| The forms collect service, inventory, location and management type, but no name or phone | Captured enquiries hold no personal data until the owner adds it. The person's details arrive on WhatsApp. |
| A clean push has not always meant a deploy: on 1 Sept 2026 four commits never built (`memory/deploy-pipeline.md`) | The page tracker checks the **live** site after every push, not git, and says so when a change has not gone live (§8.2). |
| *(Later)* GA4 `G-9L2N1S6S9F` starts on **9 Aug 2026**; consent mode went live **7 Oct 2026** | GA4 series start on 9 Aug. A fixed marker on 7 Oct explains the drop in sessions, which is measurement, not traffic. |
| *(Later)* Search Console data lags 2–3 days and is kept for only 16 months | Every sync re-pulls the last 4 days. History is stored so it outlives Google's window. |
| ~89 sitemap URLs and many 301s in `vercel.json` | Small data volume. URLs are normalised, and history for a redirected URL rolls up into its successor. |

## 2. Shape of the system

```
 www.onlinehotelier.com  (the one existing Vercel project)
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ PUBLIC PAGES                         │ /admin/  (static shell, no data)       │
 │ wa-widget.js / contact form          │  login, CRM, page tracker              │
 │   on Send: sendBeacon ──┐            │  access token held in memory only      │
 │                         ▼            │        │                ▲              │
 │ api/leads.js (new)                   │ api/admin/login · refresh · logout     │
 │                                      │  refresh token in HttpOnly cookie,     │
 │                                      │  Path=/api/admin, never readable by JS │
 └─────────┬────────────────────────────┴────────┼────────────────┼─────────────┘
 capture_lead(secret)                  Auth REST │      anon key + │ access token
 EXECUTE capture_lead()                          ▼                 │ (supabase-js)
           ┌──────────────────────────────────────────────────────▼──────────┐
           │ SUPABASE (shared with the vendor dashboard)                       │
           │  Auth      users, sessions, rate limits, optional TOTP 2FA        │
           │  Postgres  schema site_admin: CRM · dashboard · SQL functions     │
           │            RLS on every table: only admin_users get through       │
           └──────────────────────────────▲───────────────────────────────────┘
                                          │ tracker_*(secret) functions
                     ┌────────────────────┴───────────────────┐
                     │ GitHub Actions                          │
                     │  on push to main: changes, inventory,   │
                     │    template checks, live check          │
                     │  daily: re-check every page is live     │
                     └─────────────────────────────────────────┘
```

**The admin pages are static files with three small functions behind them.**
`api/admin/login`, `refresh` and `logout` handle the session (§5). Everything
else goes straight from the browser to Supabase through supabase-js, and Row
Level Security decides what each request can see. Aggregations such as the
Pages table or the before/after panels are Postgres functions called with
`supabase.rpc()`.

Three ways into the database, each with only the access it needs:

| Who | Credential | Can do |
|---|---|---|
| Admin browser | public anon key + the signed-in user's access token (held in memory) | Everything, **only if** the user is in `admin_users` (enforced by RLS) |
| Public site `api/leads.js` | anon key + `LEAD_CAPTURE_SECRET` | Call `capture_lead()` only. anon has no table access at all, and the function refuses a wrong secret. |
| GitHub Actions | anon key + `TRACKER_SECRET` | Call the `tracker_*` functions only, which write the page-tracker tables. No access to the CRM or `admin_users`. |

*Built differently from the first draft:* the draft gave each caller its own
Postgres login role and connection string. v1 uses `SECURITY DEFINER` functions
that check a shared secret against a sha256 in `app_secrets` instead. Same
isolation, but setup is pasting SQL and setting keys, with no database users or
pooler URLs to create.

The **service_role key is never deployed anywhere.** It bypasses RLS, so it stays
in the Supabase dashboard and is used only by the owner, by hand.

## 3. Hosting and Supabase project

**Admin area.** It is served at **`www.onlinehotelier.com/admin/`** by the
existing Vercel project. There is no new project and no DNS change, which keeps
the one-project rule in `memory/deploy-pipeline.md`. It ships with every push to
`main`, like any page, and is checked on the live site the same way.

`vercel.json` gains a `headers` block for `/admin/(.*)` and `/api/admin/(.*)`:

| Header | Value | Why |
|---|---|---|
| `X-Robots-Tag` | `noindex, nofollow` | Kept out of search. `robots.txt` is **not** changed: a `Disallow` would stop Google seeing the noindex, and would advertise the path. |
| `Cache-Control` | `no-store` | No CDN or browser copy of admin responses. |
| `Content-Security-Policy` | scripts from `'self'` and one pinned supabase-js URL only; `connect-src 'self'` + the Supabase project URL; `frame-ancestors 'none'` | Limits what a bug in the admin pages could load or send. |
| `Referrer-Policy` | `no-referrer` | Admin URLs (which contain lead IDs) never leak in a Referer header. |

**The admin pages break the guide rules on purpose.** They carry no GA4, no
consent banner, no WhatsApp widget, no footer, no schema, and are not in
`sitemap.xml`, `llms.txt`, `guide-nav.js` or the guides index. Leaving GA4 out
also keeps your own admin visits out of site analytics. `CLAUDE.md` gets one line
saying so when this is built, so audits and the Designer do not "fix" it.
The dashboard's own `inventory.js` collector skips `/admin/`.

**Supabase project.** This reuses the **existing Supabase project already
created for the vendor dashboard** (Mumbai, `ap-south-1`, free plan, Nano
compute; ref ending `…voorwhmkvoeak`). It is **not** the RateShopper / HMS
project (`pdjxetshxpykftcmyfvg`), and must never be, because that one holds
hotel guest data.

Sharing a project with another app changes three things:

1. **Everything lives in its own schema, `site_admin`, not `public`.** Table
   names cannot collide with the vendor dashboard's, and dropping or reworking
   either app never touches the other. The schema is added under
   Project Settings → API → **Exposed schemas**, and supabase-js is created
   with `{ db: { schema: 'site_admin' } }`.
2. **Auth is shared.** One `auth.users` list serves both apps. Both are
   internal, so **sign-up is off for the whole project**: the only accounts are
   ones the owner creates (§5). Access to this app also requires a row in
   `site_admin.admin_users`, so an account made for the vendor dashboard does not
   automatically see the CRM.
3. **Limits are shared.** The ~500 MB database cap and the 60 connections are
   split between both apps; disk was at 13% when checked on 20 Oct 2026. The
   90-day rollup in §7 matters more because of this.

**Free tier limits to plan for** (check the current numbers when setting up):
- **Inactive projects pause after about a week.** The daily GitHub Actions sync
  queries the database every day, which keeps it awake.
- **The database is capped at around 500 MB.** Query-level Search Console data is
  the only table that grows. It keeps 90 days at daily grain and is rolled into
  weekly rows after that (§7).
- **No automatic backups on free.** The leads list has an **Export CSV** button;
  download it regularly. Leads are the one thing here that cannot be rebuilt
  from git. (A GitHub Action backup was ruled out: the repo is public, so its
  artifacts and logs are too.)

## 4. Folder layout

```
src/public/admin/               ← served at /admin/ (public files, no data in them)
  index.html                    login form; goes to /admin/leads/ when signed in
  leads/index.html  leads/lead.html     CRM list and lead detail
  pages/index.html  pages/page.html     page tracker (recent changes, status)
  account/index.html                    change password
  js/core.js                    session (in-memory token), REST calls, helpers
  js/crm.js  js/tracker.js      shared vocabulary; one script per screen
  css/admin.css                 brand colours from CLAUDE.md

api/admin/
  config.js                     SUPABASE_URL + anon key from Vercel env (public by design)
  login.js                      email + password → Supabase Auth; sets refresh cookie
  refresh.js                    cookie → new access token; rotates the cookie
  logout.js                     revokes the session; clears the cookie
api/leads.js                    public enquiry capture (§6.1)
api/_lib/admin.js               shared helpers (underscore: not deployed as a function)

ops/dashboard/                  ← never deployed: the public project serves src/public only
  ARCHITECTURE.md
  supabase/migrations/
    001_schema.sql              tables
    002_security.sql            grants, is_admin(), a policy on every table
    003_functions.sql           capture_lead(), tracker_*(), secret check
  collectors/                   run by GitHub Actions only
    run.js                      entry point: --mode=push | daily, --dry-run
    changes.js                  git history, and what each edit changed
    checks.js                   template checks (§8.3), one function per check
    live-check.js               live site vs committed file, by sha256
    lib/site.js                 page list, paths, sitemap / nav / index / redirects
    lib/parse.js                title, meta, headings, schema, links, word count
    lib/supabase.js             calls the tracker_* functions
    (later: targets.js  gsc.js  ga4.js  indexing.js)
                                No dependencies: plain Node 22, nothing to install.

.github/workflows/page-tracker.yml   on push + daily
```

The three `api/admin/*` functions call Supabase Auth's REST endpoints with
`fetch`, so the root `package.json` gains no dependency. supabase-js is loaded on
the admin pages from a pinned CDN URL.

Migrations are pasted into the SQL editor, in order.

## 5. Login (Supabase Auth)

**Sign-in.** Email and password. Supabase Auth logs in with an email, not a bare
username, so **your email is your username**. If a short username is essential,
`login.html` can map `sc` to a stored email before calling Supabase. It adds
little, and is left out of v1.

**What Supabase provides, so we don't build it:**
- password hashing and storage
- access tokens that refresh automatically
- rate limiting on sign-in attempts
- password reset by email
- optional TOTP two-factor authentication on the free tier, worth turning on in
  phase 5

**Who can log in.** Internal only: the owner, plus team members the owner adds.
There is no sign-up page and no way to request an account.

**Settings to change in the Supabase dashboard** (project-wide, so they also
apply to the vendor dashboard, which is internal too):
1. Authentication → **turn off "Allow new users to sign up"**.
2. Raise the minimum password length to 12.
3. **Add** `https://www.onlinehotelier.com/admin/` to the redirect URLs (used by
   password-reset emails). Leave Site URL alone if the vendor dashboard uses it.

**Adding a team member.**
1. Authentication → Users → **Add user**: their email and a temporary password,
   with auto-confirm on.
2. Grant access to this app in the SQL editor:
   ```sql
   insert into site_admin.admin_users (user_id)
   select id from auth.users where email = 'name@…';
   ```
3. Send them the address and temporary password separately. They change the
   password on first login; the app has a "Change password" option in the
   header.

**Removing a team member.**
1. `delete from site_admin.admin_users where user_id = (select id from auth.users where email = 'name@…');`
   Access to the CRM and dashboard stops **on their next request**, because
   every RLS policy re-checks `admin_users` each time.
2. Then delete or ban the user under Authentication → Users, which ends their
   session in the vendor dashboard as well.

**All admins are equal in v1.** Everyone on the list sees and edits everything.
`leads.assigned_to` and the "who logged it" stamp on activities record who does
what, which is enough for a small team. Separate roles such as "sales sees only
their own leads" can be added later as an extra RLS condition without changing
any table.

**Why the allowlist matters even with sign-up off.** It is a second lock. If
sign-up were ever switched back on by mistake, or an account were created for
the vendor dashboard alone, that person would still see nothing here.

**Where the session lives.** By default supabase-js saves the session in
`localStorage`. At `/admin/` that storage belongs to the whole `www` origin, so
every public page, and the GA4 script on it, could read it. The admin pages
therefore split the session in two:

| Token | Lifetime | Where it is kept | Who can read it |
|---|---|---|---|
| **Access token** | 1 hour | a JavaScript variable on the admin page; never written to any storage | that admin page only, until it is closed or reloaded |
| **Refresh token** | until sign-out or 7 days idle | cookie `__Secure-oh_admin_rt`, with `HttpOnly`, `Secure`, `SameSite=Strict` and **`Path=/api/admin`** | nobody in the browser. It is sent only to the three `api/admin/*` functions. |

How it plays out:
- **Login.** `login.html` posts email and password to `api/admin/login`. The
  function calls Supabase Auth, sets the refresh cookie, and returns only the
  access token.
- **Every admin page load** calls `api/admin/refresh`, which swaps the cookie for
  a fresh access token and a rotated cookie. This is how a reload keeps you
  signed in. With no valid cookie, the page goes to the login form.
- **supabase-js** is created with `persistSession: false` and is handed the
  in-memory token. It never touches `localStorage`.
- **Sign-out** calls `api/admin/logout`, which revokes the session at Supabase
  and clears the cookie.
- **CSRF.** `SameSite=Strict` plus an `Origin` check on all three functions.

A public page cannot read either token, and neither can GA4. Supabase's own
sign-in rate limits still apply because the function calls the same Auth
endpoint.

## 6. Leads CRM

### 6.1 Capturing enquiries from the site

When a visitor clicks **Send on WhatsApp** (widget or contact form) or a
`pms_direct` link, the page:

1. Generates a short reference such as `OH-7K2MX` in the browser.
2. Appends `Ref: OH-7K2MX` to the pre-filled WhatsApp message.
3. Calls `navigator.sendBeacon('/api/leads', …)` with the reference, the form
   fields (service, inventory, location, management, message), `page_path`,
   `document.referrer` and any `utm_*` parameters.
4. Opens WhatsApp exactly as it does now.

`sendBeacon` survives the tab switching to WhatsApp and never delays it, so the
visitor's experience is unchanged. If the beacon fails, the WhatsApp message
still goes out, and the owner can add the lead by hand.

When the chat arrives, the owner searches the CRM for the reference in the
message. That opens the captured lead, already tagged with the page that
produced it. The owner then adds name, phone and hotel. That reference is what
links a person on WhatsApp back to a page on the site.

The existing `whatsapp_click` GA4 event stays as it is. GA4 counts clicks; the
CRM tracks outcomes.

**Why a Vercel function and not a direct insert from the browser.** The browser
could insert into Supabase with the anon key, but then anyone could flood
`leads` with no rate limit. Instead:

- `api/leads.js` checks the request is a same-origin POST, rejects payloads over
  4 KB and drops bots that fill a honeypot field.
- It hashes the visitor's IP with a secret salt; the raw IP is never stored.
- It calls `capture_lead(secret, ip_hash, payload)` with `LEAD_CAPTURE_SECRET`.
  That `SECURITY DEFINER` function checks fields against an allowlist, enforces
  10 captures per IP hash per hour, and inserts the lead.
- The anon key alone can do nothing: every table is closed to anon, and the
  function refuses a wrong secret.

It calls Supabase's REST API with `fetch`, so the site gains no dependency.

**Clicks with no form** (`widget_open`, `contact_direct`) carry nothing to
capture. Those enquiries are added by hand, with `source = whatsapp_direct`.

### 6.2 Pipeline

```
New → Contacted → Qualified → Proposal sent → Won
                                          └─→ Lost (reason required)
Any stage → Unresponsive  (no reply after follow-ups; can be reopened)
```

Captured leads start as **New** with no name until the owner fills it in.

### 6.3 Screens

**Leads list.**
- Overdue follow-ups pinned at the top, then everything else, newest first.
- Filter by status, service, source, source page and date range.
- Search by ref, name, phone or hotel.
- Totals across the top: open leads, won this month, and won value in ₹.

**Lead detail.**
- **Fields:** contact fields, hotel name, city and rooms, the captured form
  answers, the page it came from (linked to that page's dashboard view), status,
  deal value in ₹, and next follow-up date.
- **Timeline:** notes, calls, WhatsApp, emails, proposals and status changes,
  each stamped with who logged it and when.
- **Quick actions:** "Log WhatsApp", "Set follow-up +3 days", "Mark won".

**Add lead.** A manual form for referrals, phone calls and direct WhatsApp chats.

### 6.4 Where the CRM meets the dashboard

The Pages table gains **Leads** and **Won ₹** columns, joined on
`leads.page_path`. Page detail lists the leads that page produced. This is the
evidence `memory/analytics-setup.md` says is missing: whether the guides produce
enquiries or only readers.

### 6.5 Personal data

Leads hold names and phone numbers, so they count as personal data under the
DPDP Act (compliance deadline about May 2027, see `memory/cookie-consent.md`).

- The privacy page must say that enquiry details are stored to follow up, and
  that they are held with Supabase in the Mumbai region.
- Deleting a lead is a hard delete of the lead and its timeline, which handles
  erasure requests.
- Lost and unresponsive leads older than 24 months are flagged for deletion,
  not deleted automatically.
- The beacon itself carries no personal data, so it does not depend on the
  analytics consent choice. It is a request the visitor triggered by clicking
  Send.

## 7. Data model (Supabase Postgres, `site_admin` schema)

All tables below are in `site_admin` (§3). `001_schema.sql` creates the schema
and `002` grants `USAGE` on it to `anon` and `authenticated`. anon gets no
table privileges, only `EXECUTE` on the secret-checked functions.
It is not granted to `anon`.

**RLS is enabled on every table, with no exceptions.** The anon key is shipped
in the admin page's JavaScript and is public. An exposed table without RLS can
be read by anyone holding that key. `002_security.sql` ends with a check that fails
the migration if any table in `site_admin` has RLS off.

Migrations are pasted into the SQL editor by hand (the same practice as the
RateShopper project), so every statement is idempotent: `IF NOT EXISTS`, and
`DROP POLICY IF EXISTS` before each `CREATE POLICY`.

```sql
-- ── Access ─────────────────────────────────────────────────────────────
admin_users ( user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
              added_at TIMESTAMPTZ DEFAULT now() )
-- is_admin(): SECURITY DEFINER, search_path = '', returns
--   exists (select 1 from site_admin.admin_users where user_id = auth.uid())
-- Every table below: policy FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())
-- Page tracker tables: SELECT for admins only; writes go through 003's tracker_* functions

-- ── CRM ────────────────────────────────────────────────────────────────
leads (
  id BIGSERIAL PRIMARY KEY,
  ref TEXT UNIQUE,                      -- OH-7K2MX; NULL for manual leads
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ,
  source TEXT,          -- widget_form | contact_form | pms_direct | whatsapp_direct | phone | referral | other
  page_path TEXT, referrer TEXT, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  service TEXT, inventory TEXT, location TEXT, managed TEXT, message TEXT,   -- as captured
  name TEXT, phone TEXT, email TEXT, hotel_name TEXT, city TEXT, rooms INT, -- added by owner
  status TEXT DEFAULT 'new',            -- new | contacted | qualified | proposal | won | lost | unresponsive
  value_inr INT, lost_reason TEXT, next_follow_up DATE,
  assigned_to UUID REFERENCES auth.users
)
lead_activities (
  id BIGSERIAL PRIMARY KEY, lead_id BIGINT REFERENCES leads ON DELETE CASCADE,
  at TIMESTAMPTZ DEFAULT now(), user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
  type TEXT,                            -- note | call | whatsapp | email | proposal | status_change
  body TEXT
)
lead_capture_log ( ip_hash BYTEA, at TIMESTAMPTZ DEFAULT now() )   -- rate limiting only
-- A trigger on leads writes a status_change activity whenever status changes.

-- ── Page tracker (v1) ──────────────────────────────────────────────────
pages (
  path TEXT PRIMARY KEY, type TEXT, category TEXT,   -- guide | tool | service | hub | other
  title TEXT, title_len INT, meta_desc TEXT, meta_len INT, h1 TEXT, word_count INT,
  schema_types JSONB, canonical TEXT,
  internal_links_out INT, internal_links_in INT,
  in_sitemap BOOLEAN, in_guide_nav BOOLEAN, in_guides_index BOOLEAN,
  checks JSONB,           -- {"title_length": true, "faq_schema": false, …} see §8.3
  checks_failed INT,
  repo_hash TEXT,         -- sha256 of the file at the latest commit
  first_added TIMESTAMPTZ, last_changed TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ, -- set when the file disappears; the row is kept
  scanned_at TIMESTAMPTZ
)
changes ( commit_sha TEXT, path TEXT, committed_at TIMESTAMPTZ, author TEXT,
          message TEXT,
          change_type TEXT,     -- added | modified | deleted | renamed
          kinds JSONB,          -- title, meta, h2s, schema, links, body …
          lines_added INT, lines_removed INT,
          live_status TEXT,     -- pending | live | not_live (see §8.2)
          live_confirmed_at TIMESTAMPTZ,
          PRIMARY KEY (commit_sha, path) )
live_checks ( path TEXT, checked_at TIMESTAMPTZ, http_status INT,
              live_hash TEXT, matches_repo BOOLEAN, redirect_to TEXT,
              PRIMARY KEY (path, checked_at) )   -- last 30 days kept
redirects ( from_path TEXT PRIMARY KEY, to_path TEXT )
sync_runs ( id BIGSERIAL PRIMARY KEY, source TEXT, started_at TIMESTAMPTZ,
            finished_at TIMESTAMPTZ, rows INT, status TEXT, error TEXT )

-- ── Later (not created in v1) ──────────────────────────────────────────
targets ( path TEXT, keyword TEXT, role TEXT, PRIMARY KEY (path, keyword) )
gsc_page_daily   ( date DATE, path TEXT, clicks INT, impressions INT, ctr REAL,
                   position REAL, PRIMARY KEY (date, path) )
gsc_query_daily  ( date DATE, path TEXT, query TEXT, clicks INT, impressions INT,
                   ctr REAL, position REAL, PRIMARY KEY (date, path, query) )   -- last 90 days
gsc_query_weekly ( week DATE, path TEXT, query TEXT, clicks INT, impressions INT,
                   position REAL, PRIMARY KEY (week, path, query) )             -- older
ga_page_daily ( date DATE, path TEXT, sessions INT, views INT, engaged_sessions INT,
                engagement_secs REAL, wa_clicks INT, PRIMARY KEY (date, path) )
index_status ( path TEXT, checked_at DATE, verdict TEXT, coverage_state TEXT,
               last_crawl TIMESTAMPTZ, google_canonical TEXT,
               PRIMARY KEY (path, checked_at) )
```

At ~90 pages, the v1 page tracker tables stay well under 5 MB.

**Functions:** v1 reads tables directly; there are no read functions. Later: `change_impact(commit, path)`,
`keyword_cannibalisation(days)`, `keyword_striking_distance(days)`,
`keyword_orphans(days)`.

They are all `SECURITY INVOKER`, so RLS applies to them as it does to a direct
query. Postgres lets every role run a new function by default, so each one is
created with `REVOKE EXECUTE … FROM PUBLIC, anon` and
`GRANT EXECUTE … TO authenticated`.

## 8. Page tracker: how the data is collected

Everything runs in **GitHub Actions** (`.github/workflows/page-tracker.yml`),
through the `tracker_*` functions. Actions has the full git history, which Vercel
functions do not.

### 8.1 On every push to `main`

| Step | What it does |
|---|---|
| `changes.js` | `git log --name-status` since the last stored commit, for files under `src/public/` (excluding `/admin/`). Records each file as **added, modified, deleted or renamed**, with the commit message and author. For modified pages it compares the old and new parsed versions and labels what changed: `title`, `meta`, `h2s`, `schema`, `links`, `body`. That is what lets the tracker say "meta description rewritten" instead of "+3 −3". |
| `inventory.js` | Parses every page: title, meta, H1, word count, JSON-LD types, canonical, internal links in and out. Records whether it is in `sitemap.xml`, `guide-nav.js` and the `guides/index.html` cards, and runs the template checks (§8.3). The first run seeds `first_added` for every existing page from `git log --diff-filter=A`, so the history covers the whole site from day one. |
| `redirects.js` | Loads `vercel.json` redirects, so a deleted page that now 301s shows where it went. |
| `live-check.js` | Waits for Vercel, then confirms each changed page is live (§8.2). |

### 8.2 Is it actually live?

The live check compares what Vercel serves with what is in git.

- It fetches the page from `www.onlinehotelier.com` with a cache-busting query
  string and `Cache-Control: no-cache`, the same method as
  `memory/deploy-pipeline.md`.
- Vercel serves static files byte for byte, so the SHA-256 of the live response
  must equal the SHA-256 of the file at the pushed commit.
- After a push it checks every 30 seconds for up to 10 minutes, then records
  the result on each `changes` row.

| Result | Shown as |
|---|---|
| 200 and the hashes match | **Live** |
| 200, but the hash still matches an older commit after 10 minutes | **Not live: deploy did not run** (the 1 Sept 2026 failure) |
| 404 on an added page | **Not live: missing** |
| 301/308 | **Redirects to …** |
| Deleted file, URL still returns 200 | **Still live after delete** |

A failed check also fails the GitHub Action, so GitHub emails the owner without
anyone opening the admin area.

A **daily run** re-checks every page. That catches anything that broke without a
push, and keeps the Supabase project from pausing on the free plan.

### 8.3 Template checks

These are the mandatory elements from CLAUDE.md and `memory/guide-template.md`,
checked automatically from the HTML. Guides get the full list; tools and other
pages get the rows that apply to them.

| Check | Passes when |
|---|---|
| Title | 60–70 characters and ends with `\| OnlineHotelier` |
| Meta description | 150–160 characters |
| Canonical | present and points to `https://www.onlinehotelier.com/…` |
| Quick Answer box | present at the top of the content (guides) |
| TOC | `has-toc` on `guide-page-layout`, `<aside class="guide-toc">`, and every H2 has an `id` (guides) |
| Related Tools & Guides | `.explore-tools` with exactly four `.tool-link` cards (revenue guides; others once migrated) |
| Schema | Article, BreadcrumbList and Organization; FAQPage when the page has an FAQ |
| Consent | default-consent block before the GA4 loader, `consent.css` in the head, `consent.js` before `</body>` |
| AdSense | no AdSense loader (removed 7 Oct 2026) |
| Crawler meta | robots, googlebot and bingbot meta tags |
| Footer | `footer.css` linked, and the footer is a direct child of `<body>` |
| Listed | in `sitemap.xml`; guides also in `guide-nav.js` and on `/guides/` |
| Linked | at least two internal links in from other guides |
| Brand colours | none of the banned Material Design colours in inline styles |

The checks live in `ops/dashboard/collectors/checks.js` as one function per row,
so a template change means editing one function.

### 8.4 Screens

**Pages** (the main view). One row per page, newest change first:
- page title and path, type and category
- **added on** and **last changed**: date, what changed, and the commit message
- **live status** (§8.2)
- **listed in**: sitemap, nav and `/guides/` ticks
- **checks**: "12/14", with the two failures named on hover

Filters: type, category, "changed in the last 7 / 30 days", "not live",
"failing checks" and "not listed". The default view, **Recent changes**, shows
the last 30 days of added, modified and deleted pages, which is what you open
after a publishing session.

**Page detail.**
- every field above
- each failed check with the reason, such as "meta is 171 characters"
- the full change history, commit by commit, with what changed and whether each
  change went live
- the last 30 days of live checks
- leads that came from this page, linked to the CRM

**Deleted pages** stay listed under a "Removed" filter, with where they
redirect now.

### 8.5 Later: Google data collectors (not in v1)

| Collector | Trigger | What it does |
|---|---|---|
| `targets.js` | push to `main` | Loads `targets.json`. |
| `gsc.js` | daily | Search Analytics API, `dataState: final`, paginated at 25,000 rows. Two calls: `[date, page]` for page totals, `[date, page, query]` for queries. Re-pulls the last 4 days. Rolls query rows older than 90 days into weekly. |
| `ga4.js` | daily | GA4 Data API: `date, pagePath` × sessions, views, engaged sessions, engagement time. A second report counts `whatsapp_click` by `customEvent:page_path`. |
| `indexing.js` | weekly | URL Inspection API (2,000 a day quota, so ~90 pages is fine): verdict, coverage, last crawl, Google's chosen canonical. |

**Use the `[date, page]` call for page totals, never the query rows added up.**
Google drops anonymised queries from any query-level breakdown, so the sum
undercounts.

`collectors/lib/normalize.js` is the only function that turns a URL into a
`path`. It drops `www` and `insights`, strips querystrings and fragments, keeps
`.html` and trailing slashes as the live site serves them, and resolves through
`redirects`.

`targets.json` example:
```json
{ "/guides/ota/makemytrip-commission.html": {
    "primary": "makemytrip commission for hotels",
    "secondary": ["mmt commission", "makemytrip hotel commission rate"] } }
```
Adding the SEO Expert's primary keyword here becomes a step in CLAUDE.md's
"After creating any new guide" checklist.

## 9. Later: analytics screens (not in v1)

The v1 screens are in §8.4 (page tracker) and §6.3 (CRM). These come with §8.5.

**Overview.**
- Last-28-day clicks, impressions, CTR, position, sessions, WA clicks, new leads
  and won ₹, each against the previous 28 days.
- Biggest movers up and down.
- Overdue lead follow-ups.
- Last sync status per source.

**Pages** (one row per page). Type, category, what last changed and when, clicks,
impressions, CTR, position, sessions, WA clicks, leads, won ₹, top actual query,
rank for the target keyword, and index verdict. It also shows these flags:
- title outside 60–70 chars or missing `| OnlineHotelier`
- meta outside 150–160 chars
- missing from the sitemap, `guide-nav.js` or `guides/index.html`
- live 30+ days with no impressions
- Google canonical ≠ our canonical
- target keyword not among the page's top 20 queries

**Page detail.** A daily clicks and impressions chart with a marker for each
commit to the page and a fixed marker on 7 Oct 2026 for consent. Under it:
- target keywords against the queries the page actually attracts
- the change log
- leads from this page
- for each change, a **before/after panel**: 28 days before against 28 days
  after (deploy date plus 3 days for Search Console lag) for clicks,
  impressions, position and CTR

**Keywords.**
- *Cannibalisation*: queries where two or more of our pages each get a
  meaningful share of impressions.
- *Striking distance*: queries at position 8–20 with high impressions.
- *Orphan demand*: queries with impressions but no page targeting them, which
  feed the Content Strategist.

**Changes.** Every commit that touched a page, newest first, with before/after
deltas once 28 days have passed.

## 10. Secrets

| Secret | Lives in | Notes |
|---|---|---|
| `SUPABASE_URL`, anon key | `src/public/admin/js/config.js`, and Vercel env for `api/admin/*` | Public by design. Safe only because RLS is on every table. |
| `LEAD_CAPTURE_SECRET` | Vercel project env | Lets `api/leads.js` call `capture_lead()`. Also the HMAC key that hashes visitor IPs. |
| `TRACKER_SECRET` | GitHub Actions secrets | Lets the page tracker call `tracker_*()`. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | GitHub Actions secrets (**later**, not v1) | Restricted user on Search Console, Viewer on GA4. Both read-only. |
| service_role key | **nowhere** | Stays in the Supabase dashboard. |

Nothing secret goes in the repo. Local development uses `ops/dashboard/.env`,
which the existing `.env` rule in `.gitignore` already covers.

## 11. Build order

| Phase | Scope | Why this order |
|---|---|---|
| **1** | Migrations 001–003, Auth settings, `api/admin/*` session functions, `vercel.json` admin headers, login page, CRM screens, manual lead entry, weekly backup. | Usable on day one with no other dependency. |
| **2** | `api/leads.js` and the `sendBeacon` capture with the ref code in the widget, contact form and `pms_direct` links. | From this point every enquiry is recorded with its source page. Each day before it ships is attribution lost for good. |
| **3** | Page tracker: `changes.js`, `inventory.js`, `checks.js`, `redirects.js`, `live-check.js`, the page-tracker workflow, migration 004, Pages and Page detail screens. | No Google setup needed. **End of v1.** |
| *Later* | Search Console, GA4 and indexing collectors, keyword views, before/after panels (§8.5, §9). TOTP two-factor. CSV export of leads. | Needs the Google service account. |

Phase 2 changes two public files (`wa-widget.js`, `contact/index.html`) and the
PMS service page. It goes through the normal CEO review before shipping, and is
checked on the live site afterwards, per `memory/deploy-pipeline.md`.

## 12. What is needed from the owner to start phase 1

1. **Supabase project: decided.** Reuse the vendor dashboard project (§3).
   Sign-up is off project-wide; both apps are internal. Still needed: the
   output of the check query below, so `site_admin` is built knowing what is
   already there.
2. **The full project URL and anon key.** The service_role key is not needed and
   should not be shared.
3. **Who logs in: decided.** The owner, plus team members added by hand
   (§5). Still needed: the owner's login email.
4. **Admin address: decided.** `www.onlinehotelier.com/admin/`, served by the
   existing Vercel project (§3).
5. **Ref code in WhatsApp.** Fine for a line like `Ref: OH-7K2MX` to appear at
   the end of every pre-filled message?
6. **Existing leads** to import at launch, and roughly how many.

Only when the Google data is added later: the Search Console property type
(Domain or URL-prefix) and the GA4 numeric property ID.

**Check query** for the shared project (read-only, run in the SQL editor):

```sql
select n.nspname as schema, c.relname as table_name,
       c.relrowsecurity as rls_on,
       pg_size_pretty(pg_total_relation_size(c.oid)) as size
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname not in ('pg_catalog','information_schema','auth','storage',
                        'realtime','supabase_functions','extensions','graphql',
                        'graphql_public','pgsodium','vault','net','cron')
order by 1, 2;
```
