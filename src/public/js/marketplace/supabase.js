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

// A failed email link lands back here with the reason in the URL hash
// (#error=access_denied&error_code=otp_expired&...). Read it once, then
// clear it so a reload does not show it again.
function takeLinkError() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (!params.get('error')) return null;
  history.replaceState(null, '', location.pathname + location.search);
  return params.get('error_code') === 'otp_expired'
    ? 'That sign-in link has expired or was already used. Links work once, and only the newest one works. Request a new one below.'
    : `Sign-in failed: ${params.get('error_description') || params.get('error')}. Request a new link below.`;
}

// Renders email sign-in into `root`. The email carries both a link and a
// one-time code. Supabase picks the session up from the link automatically;
// the code is the fallback for when a mail scanner has already used the link
// or the link redirects somewhere unexpected.
export function renderSignIn(root, { title, intro }) {
  const linkError = takeLinkError();
  root.innerHTML = `
    <section class="card signin">
      <h1>${esc(title)}</h1>
      <p class="muted">${esc(intro)}</p>
      ${linkError ? `<p class="error" role="alert">${esc(linkError)}</p>` : ''}
      <form id="signin-form">
        <label for="signin-email">Work email</label>
        <input id="signin-email" type="email" required autocomplete="email" placeholder="you@company.com">
        <button class="btn btn-primary" type="submit">Email me a sign-in link</button>
      </form>
      <form id="code-form" hidden>
        <label for="signin-code">Or enter the code from the email</label>
        <input id="signin-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" required placeholder="123456">
        <button class="btn btn-primary" type="submit">Sign in</button>
        <button class="btn btn-link" type="button" id="signin-restart">Use a different email</button>
      </form>
      <p id="signin-msg" class="muted" role="status"></p>
    </section>`;

  const emailForm = root.querySelector('#signin-form');
  const codeForm = root.querySelector('#code-form');
  const msg = root.querySelector('#signin-msg');
  let email = '';

  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = emailForm.querySelector('button');
    btn.disabled = true;
    email = root.querySelector('#signin-email').value.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname },
    });
    btn.disabled = false;
    if (error) {
      msg.textContent = `Could not send the email: ${error.message}`;
      return;
    }
    root.querySelector('.error')?.remove();
    emailForm.hidden = true;
    codeForm.hidden = false;
    msg.textContent = `Sent to ${email}. Click the link in the email, or type its code here. Only the newest email works.`;
    root.querySelector('#signin-code').focus();
  });

  codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = codeForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    const token = root.querySelector('#signin-code').value.replace(/\D/g, '');
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    btn.disabled = false;
    if (error) {
      msg.textContent = `${error.message}. Check you used the code from the newest email.`;
      return;
    }
    location.reload();
  });

  root.querySelector('#signin-restart').addEventListener('click', () => {
    codeForm.hidden = true;
    emailForm.hidden = false;
    msg.textContent = '';
  });
}

export function renderUserBar(el, user) {
  el.innerHTML = `<span>${esc(user.email)}</span> <button class="btn btn-link" id="signout">Sign out</button>`;
  el.querySelector('#signout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.reload();
  });
}
