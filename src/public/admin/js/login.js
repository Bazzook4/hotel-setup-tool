(function () {
  'use strict';
  var form = document.getElementById('login-form');
  var errorBox = document.getElementById('login-error');
  var btn = document.getElementById('login-btn');

  function next() {
    var n = OH.param('next');
    return n && n.indexOf('/admin/') === 0 ? n : '/admin/leads/';
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }

  if (OH.param('expired')) showError('Your session ended. Please sign in again.');

  // Already signed in? Go straight through.
  OH.loadConfig()
    .then(function () { return OH.refresh(); })
    .then(function (ok) { if (ok) window.location.replace(next()); })
    .catch(function () { showError('The admin area is not configured yet (Supabase keys missing in Vercel).'); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorBox.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      await OH.login(document.getElementById('email').value, document.getElementById('password').value);
      window.location.replace(next());
    } catch (err) {
      showError(err.message);
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
})();
