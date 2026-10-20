(async function () {
  'use strict';
  var user = await OH.requireAdmin('account');
  document.getElementById('acct-email').textContent = user.email;

  var form = document.getElementById('pw-form');
  var err = document.getElementById('pw-error');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    err.classList.add('hidden');
    var a = document.getElementById('pw1').value;
    var b = document.getElementById('pw2').value;
    var problem = a.length < 12 ? 'Use at least 12 characters.' : a !== b ? 'The two passwords do not match.' : '';
    if (problem) { err.textContent = problem; err.classList.remove('hidden'); return; }
    try {
      await OH.changePassword(a);
      form.reset();
      OH.toast('Password changed');
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.remove('hidden');
    }
  });
})();
