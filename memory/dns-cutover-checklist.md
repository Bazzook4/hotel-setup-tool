# DNS Cutover Checklist — Wix → Namecheap → Vercel

Captured from the live Wix zone on 2026-08-04, before any changes.

**Setup:** nameservers are `ns12.wixdns.net` / `ns13.wixdns.net` — Wix is the DNS provider.
Moving nameservers to Namecheap means the entire zone must be rebuilt there first.

**Do NOT disconnect the domain inside Wix.** That can wipe the zone, including email.
Keep the Wix subscription for ~30 days as rollback.

---

## CURRENT ZONE (backup — do not lose this)

### A records
| Host | Value | Note |
|---|---|---|
| onlinehotelier.com | 185.230.63.107 | Wix — **replace with Vercel** |
| onlinehotelier.com | 185.230.63.186 | Wix — **replace with Vercel** |
| onlinehotelier.com | 185.230.63.171 | Wix — **replace with Vercel** |
| insights.onlinehotelier.com | 216.198.79.193 | **Vercel — already correct, keep** |

### CNAME records
| Host | Value | Keep? |
|---|---|---|
| www | cdn1.wixdns.net | **NO — replace with Vercel** |
| en | cdn1.wixdns.net | No — Wix language subdomain, dead after migration |
| _dmarc | _dmarc.wixemails.com | See warning below |
| s1._domainkey | s1._domainkey.onlinehotelier.com.s009.ascendbywix.com | Only if using Wix email marketing |
| s2._domainkey | s2._domainkey.onlinehotelier.com.s009.ascendbywix.com | Only if using Wix email marketing |
| sel1._domainkey | sel1._domainkey.onlinehotelier.com.s009.ascendbywix.com | Only if using Wix email marketing |
| sg | sg.onlinehotelier.com.s009.ascendbywix.com | Only if using Wix email marketing |

### TXT records
| Host | Value | Keep? |
|---|---|---|
| @ | `v=spf1 include:zoho.in ~all` | **YES — email** |
| @ | `google-site-verification=LRHYYGxzJRQV2FbfKKEWz2wiAYmMZxMC9SlplZOL0XY` | **YES — Search Console** |

### MX records
| Host | Points to | Priority |
|---|---|---|
| @ | mx.zoho.in | 10 |

**Zoho normally publishes three MX hosts** (mx.zoho.in / mx2.zoho.in / mx3.zoho.in). Only one
is present. Check the Zoho admin console for the full set and add all of them at Namecheap —
a single MX is a single point of failure for mail.

---

## ⚠️ THE DMARC TRAP

`_dmarc` currently points at `_dmarc.wixemails.com`, which resolves to:

```
v=DMARC1; p=none; rua=mailto:dmarc_agg@vali.email
```

That is **Wix's DMARC policy, not yours.** Once DNS leaves Wix, this CNAME may stop resolving
and the domain loses its DMARC record entirely.

Replace it with your own TXT record at Namecheap:

| Type | Host | Value |
|---|---|---|
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:supponlinehotelier@gmail.com` |

`p=none` is monitor-only and matches the current effective policy, so nothing about mail
delivery changes. Do not set `p=quarantine` or `p=reject` during a migration.

---

## TARGET ZONE AT NAMECHEAP

Build all of this **before** switching nameservers.

### Email — add these FIRST and verify
| Type | Host | Value | Priority |
|---|---|---|---|
| MX | @ | mx.zoho.in | 10 |
| MX | @ | mx2.zoho.in (confirm in Zoho) | 20 |
| MX | @ | mx3.zoho.in (confirm in Zoho) | 50 |
| TXT | @ | `v=spf1 include:zoho.in ~all` | |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:supponlinehotelier@gmail.com` | |
| TXT/CNAME | (Zoho DKIM) | get from Zoho admin → Email Authentication | |

Zoho DKIM is **not currently published** on this domain — the only DKIM records are Wix's
(`s1`/`s2`/`sel1._domainkey` → ascendbywix.com). Set up Zoho DKIM in the Zoho console and add
whatever record it gives you. Without it, outbound mail is more likely to land in spam.

### Website
| Type | Host | Value |
|---|---|---|
| A | @ | (Vercel's IP — read from Vercel "View DNS configuration") |
| CNAME | www | (Vercel's CNAME target) |
| A | insights | 216.198.79.193 |

**`insights` must be carried over.** Miss it and the subdomain dies, taking every redirect and
old indexed URL with it.

### Verification
| Type | Host | Value |
|---|---|---|
| TXT | @ | `google-site-verification=LRHYYGxzJRQV2FbfKKEWz2wiAYmMZxMC9SlplZOL0XY` |

### Drop these
`en` CNAME, and the four Wix email-marketing records (`s1`/`s2`/`sel1._domainkey`, `sg`) unless
Wix email campaigns are still in use.

---

## ORDER OF OPERATIONS

1. Confirm the full Zoho MX list and set up Zoho DKIM
2. Build the complete zone at Namecheap → Advanced DNS (records exist but are inactive while
   nameservers still point at Wix)
3. Namecheap → Domain → Nameservers → switch from Custom DNS to **Namecheap BasicDNS**
4. Wait for propagation (30 min – a few hours)
5. **Verify email first** — send a test message in and out
6. Verify the site: apex → www, and a `.html` guide page, not just directory URLs
7. Re-add the subdomain redirect to `vercel.json` (removed 2026-08-04 — it was 301ing into a
   Wix 404 before cutover)
8. Verify the six critical pages: one hop, 200 at the end
9. Search Console → Change of Address on the insights property
10. Submit sitemap on the www property

## AFTER

- Keep Wix paid ~30 days (rollback)
- Keep `insights` pointed at Vercel permanently
- No content changes for 2–3 weeks so traffic effects stay attributable

Related: [[migration-plan]]
