// Shared Supabase client for the marketplace portals (/vendor/, /admin/).
// The publishable key is meant to ship to browsers: access control is the
// row-level security in supabase/migrations/001_marketplace.sql, not the key.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';

const SUPABASE_URL = 'https://gnqlvwpyoorwhmkvoeak.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JhP26eAdpdM2GMbfaZHuyA_J-q9MAfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const BUCKET = 'marketplace';
export const MAX_SCREENSHOTS = 10;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export function publicUrl(path) {
  return path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : '';
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function checkImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: use PNG, JPG, WebP or SVG.`;
  if (file.size > MAX_FILE_BYTES) return `${file.name}: larger than 5 MB.`;
  return null;
}

export function extOf(file) {
  return ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' })[file.type];
}

export function toast(message, isError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' toast-error' : '');
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), isError ? 6000 : 3000);
}

// Renders the magic-link sign-in form into `root`. Supabase picks the session
// up from the link automatically when the user lands back on this page.
export function renderSignIn(root, { title, intro }) {
  root.innerHTML = `
    <section class="card signin">
      <h1>${esc(title)}</h1>
      <p class="muted">${esc(intro)}</p>
      <form id="signin-form">
        <label for="signin-email">Work email</label>
        <input id="signin-email" type="email" required autocomplete="email" placeholder="you@company.com">
        <button class="btn btn-primary" type="submit">Email me a sign-in link</button>
      </form>
      <p id="signin-msg" class="muted" role="status"></p>
    </section>`;
  root.querySelector('#signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = root.querySelector('#signin-msg');
    btn.disabled = true;
    const email = root.querySelector('#signin-email').value.trim();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname },
    });
    btn.disabled = false;
    msg.textContent = error
      ? `Could not send the link: ${error.message}`
      : `Check ${email} for a sign-in link. It expires in an hour.`;
  });
}

export function renderUserBar(el, user) {
  el.innerHTML = `<span>${esc(user.email)}</span> <button class="btn btn-link" id="signout">Sign out</button>`;
  el.querySelector('#signout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
  });
}
