# Cookie Consent

Analytics cookies are **denied by default** on every page. GA4 sends cookieless
pings until the visitor accepts via the banner. Set up 7 Oct 2026.

## Why this exists

Two separate obligations, and only one of them is about the EU.

- **India, DPDP Act 2023.** The final DPDP Rules were notified **13 November
  2025** and the Act is in force on a phased schedule, with full compliance
  expected around **May 2027**. Section 6 requires consent that is free,
  specific, informed, unambiguous and given by clear affirmative action.
  Guidance is explicit that non-essential cookies must be blocked until the
  visitor opts in, and that disclosing cookie use in a privacy policy is **not**
  sufficient. This is the deadline that matters, because the audience is Indian.
- **EU/UK, GDPR + ePrivacy.** Applies to any EEA/UK visitor regardless of where
  the site is hosted. The site gets some inbound European traffic from the
  international-guests and Agoda content.

## AdSense was removed, not consented

`ca-pub-6118286051054894` was loaded on 80 pages but **no ad units ever
existed**: zero `<ins class="adsbygoogle">` elements, zero `push()` calls. The
loader still ran on every page view and could set cookies, so it carried the
full consent obligation and returned nothing.

Google's EU User Consent Policy would have required a **Google-certified CMP
integrated with IAB TCF v2.2** for personalised ads to EEA/UK (since 16 Jan
2024) and Switzerland (since 31 Jul 2024). A hand-rolled banner does not
satisfy that. Removing the loader avoided the whole requirement.

**If ads are ever added back, this banner is not enough.** Enable Google's
Privacy & Messaging (Funding Choices) in the AdSense account instead, because
it is certified by definition and geo-targets automatically.

## How it works

Three pieces, on all 80 real pages:

1. **Inline consent default**, in the head **above** the GA4 loader:
   `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization`
   all `'denied'`. It must be inline and must come first. A deferred or
   external script cannot run before `gtag/js`, and once that has executed
   with storage allowed the cookie is already written.
2. **`/css/consent.css`** in the head.
3. **`/js/consent.js`** before `</body>`, which renders the banner and sends
   `gtag('consent','update', …)` on choice.

State lives in `localStorage` under `oh_consent` as `{v:1,state:'granted'|'denied'}`.
No cookie is set by the banner itself. Every access is wrapped in try/catch
because `localStorage` throws in private mode and with site data blocked; on
failure the banner simply shows again, which is the safe direction.

## Rules that are easy to break

- **Accept and Decline must be equally easy.** Same size, same weight, neither
  pre-selected. "Accept" alone, or a buried decline, fails both DPDP section 6
  and GDPR. The two buttons share `.oh-consent-btn` for exactly this reason.
- **The default block goes above the loader.** Verify ordering after any head
  edit, not just that the block exists.
- **`#89826E` is not usable for text on the banner.** It is a dark `#3E3D35`
  panel; the secondary lands at 2.85:1, under AA. White is 10.92:1 and the pale
  link `#D9D5C7` is 7.43:1. See [[design-system]] on the dark-panel trap.
- **The `samples/` pages are excluded.** They are noindex, absent from the
  sitemap, disallowed in robots.txt, carry no GA4, and are client mockups
  rather than OnlineHotelier pages.

## Known gap

There is no "change your cookie settings" control once a choice is made. The
privacy policy tells visitors to clear site data to be asked again. A persistent
re-open link in the footer would be better and is not built.

Related: [[analytics-setup]], [[design-system]], [[guide-template]],
[[tool-page-standard]]
