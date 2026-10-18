// Editorial copy for the /software/ directory, read by api/software.js.
//
// HOME_CONTENT feeds the directory home page. CATEGORY_CONTENT is keyed by
// category slug (e.g. 'channel-manager'); every field is optional because
// renderCategory() falls back to generic copy built from the category name.
// Fields a category entry can set: title, h1, intro, shortName, blurb,
// whatIsHeading, whatIs, guide { href, anchor }, vendorsHeading,
// lookForHeading, lookFor, faqs [{ q, a }].

export const HOME_CONTENT = {
  title: 'Hotel Software in India: PMS, Channel Manager & More | OnlineHotelier',
  description: 'Compare hotel software for Indian properties: PMS, channel managers, booking engines and RMS. See the vendors serving India and get help choosing what fits.',
  h1: 'Hotel Software for Indian Hotels',
  intro: '<p>Compare the PMS, channel manager, booking engine and revenue management companies serving independent hotels in India. Not sure where to start? Message us and we will help you shortlist what fits your property.</p>',
};

export const CATEGORY_CONTENT = {};
