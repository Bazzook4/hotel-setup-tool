Verify every agent finding against the files before acting on it. Run an independent check of the same claim; do not take a confident report at face value.

**Why:** During the 2026-08-24 guide audit, every agent produced at least one wrong finding stated with full confidence. Acting on any of them unchecked would have shipped a defect:

- **Content Head** said the GST rates were wrong (correct) and that the current slabs are 12%/18% (also wrong). Two web searches confirmed the 56th GST Council replaced them on **22 Sept 2025** with **5% up to ₹7,500 (no ITC) and 18% above (with ITC)**. Publishing its correction would have put wrong tax rates in front of hoteliers. The same agent also said "no em dashes found" and then found one in the next paragraph; the real count was 77 answers.
- **SEO Expert** filed "all 59 canonicals point to the wrong domain" as CRITICAL. False, see [[stale-doc-false-alarms]]. It also called 20 pages "orphans" when all were linked from category index pages, though the underlying JS-injection problem it half-sensed was real and worse.
- **Designer** said `.quick-answer` uses a gradient. Partly true: 30 pages use flat `#3E3D35`, 11 use the brand gradient, 7 use Material colours. Neither the agent nor my own first grep had the whole picture.
- **CEO** guessed the software guides had zero inbound links. They had 2 to 21 each, none orphaned.

**How to apply:** Treat agent reports as leads, not conclusions. Grep or script the claim yourself across all files rather than trusting a sample. For anything time-sensitive (tax rates, OTA commissions, platform policies) search the web rather than relying on training data or an agent's recall. When two agents conflict, resolve it by reading the actual files: the Designer and SEO Expert disagreed on CTA placement (inside vs outside `.article-content`) and the answer was visible in the CSS, `.article-content` is a white card with padding, so an outside panel would float on the page background.

Related: [[stale-doc-false-alarms]], [[guide-audit-2026-08]]
