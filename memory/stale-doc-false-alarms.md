Before reporting a value mismatch (a domain, an ID, a tax rate) as a defect, check the repo and `memory/` first. CLAUDE.md is a summary of the repo, not the source of truth, and its values drift between sessions.

**Why:** This has produced two false CRITICAL findings from agent audits on 2026-08-24, each burning a review cycle:

1. The SEO Expert reported "all 59 canonicals point to the wrong domain" because CLAUDE.md said the live domain was `insights.onlinehotelier.com`. It was not. `vercel.json` redirects `insights` → `www` (9 redirects), robots.txt and sitemap.xml are on `www`, and there were zero `insights.` references left in `src/public`. The canonicals were correct.
2. A mandatory-elements sweep flagged "analytics missing on 52/52 guides" because CLAUDE.md said `G-Q2BPYRGZTM`. That property was retired on 9 Aug 2026; the site uses `G-9L2N1S6S9F` on all 83 pages. `memory/analytics-setup.md` (in the repo) already documented this, as do commits b15a429 and 5672dfc.

**How to apply:** Treat CLAUDE.md values as a hint, never as evidence. Verify against, in order: the actual files, `memory/analytics-setup.md` (tracking), [[migration-plan]] (domain), guide body copy (GST rates), git log. CLAUDE.md now carries a "Values drift, rules do not" note saying the same. When you do find a genuinely stale value, fix CLAUDE.md in the same pass so the next session does not repeat the cycle.

Related: [[migration-plan]], [[agent-verification-discipline]]
