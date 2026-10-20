# Admin area (/admin/)

Built 20 Oct 2026. A private, login-only area at `www.onlinehotelier.com/admin/`
with a **leads CRM** and a **page tracker**. Full design and reasoning:
`ops/dashboard/ARCHITECTURE.md`.

## Where things are

| What | Where |
|---|---|
| Admin pages (static shells, no data in them) | `src/public/admin/` |
| Session functions | `api/admin/` (login, refresh, logout, config) |
| Website enquiry capture | `api/leads.js`, called by `captureLead()` in `src/public/js/wa-widget.js` |
| Database | Supabase project shared with the vendor dashboard, schema **`site_admin`** |
| Migrations | `ops/dashboard/supabase/migrations/` (pasted into the SQL editor by hand) |
| Page tracker | `ops/dashboard/collectors/`, run by `.github/workflows/page-tracker.yml` |

## Rules

- **Admin pages are exempt from the guide and tool templates.** No GA4, no
  consent banner, no WhatsApp widget, no footer, no schema, not in the sitemap,
  `llms.txt`, `guide-nav.js` or the guides index. Do not "fix" them.
- **Never put data or a secret in `src/public/admin/`.** It is publicly
  served. Protection is Supabase Row Level Security plus the
  `site_admin.admin_users` allowlist, never the URL.
- **Every table in `site_admin` must have RLS on.** `002_security.sql` fails if
  one does not. The anon key is public.
- **The login token never goes in localStorage.** `/admin/` shares an origin
  with every public page and GA4. Access token in memory, refresh token in an
  HttpOnly cookie scoped to `/api/admin`.
- **Every WhatsApp enquiry carries `Ref: OH-XXXXX`.** It is how a chat is
  matched to its lead and source page. Keep it when editing the widget,
  contact form or PMS CTAs.
- **The page tracker reads the live site, not git.** A run fails (and GitHub
  emails the owner) when a pushed page is not live within 10 minutes. See
  [[deploy-pipeline]].
- The repo is public: tracker logs print paths and counts only, never leads.

## Adding or removing a team member

Add: Supabase → Authentication → Add user (auto-confirm), then
`insert into site_admin.admin_users (user_id) select id from auth.users where email = '…';`
Remove: delete that row (access stops on the next request), then delete the
user in Authentication.

## Backups

The free Supabase plan has none. Use **Export CSV** on the leads page.

Related: [[deploy-pipeline]], [[analytics-setup]], [[cookie-consent]]
