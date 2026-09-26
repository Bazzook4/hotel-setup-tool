import { supabase, esc, toast, renderSignIn, renderUserBar } from './supabase.js';
import { renderEditor } from './editor.js';

const main = document.getElementById('main');
const userBar = document.getElementById('user-bar');

async function start() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    renderSignIn(main, {
      title: 'List your software on OnlineHotelier',
      intro: 'Sign in with your work email. We send a one-time link, so there is no password to remember.',
    });
    return;
  }
  renderUserBar(userBar, session.user);

  // Links any listing the OnlineHotelier team created for this email.
  await supabase.rpc('claim_my_companies');

  const { data: companies, error } = await supabase
    .from('companies').select('id, name, status')
    .eq('owner_id', session.user.id).order('created_at');
  if (error) {
    main.innerHTML = `<p class="error">Could not load your listings: ${esc(error.message)}</p>`;
    return;
  }

  if (!companies.length) return renderCreate();

  main.innerHTML = `
    ${companies.length > 1 ? `
      <label for="pick">Listing</label>
      <select id="pick">${companies.map((c) => `<option value="${c.id}">${esc(c.name)} (${c.status})</option>`).join('')}</select>` : ''}
    <div id="editor"></div>`;
  const editor = main.querySelector('#editor');
  const pick = main.querySelector('#pick');
  renderEditor(editor, companies[0].id);
  pick?.addEventListener('change', () => renderEditor(editor, pick.value));
}

function renderCreate() {
  main.innerHTML = `
    <section class="card">
      <h1>Create your company listing</h1>
      <p class="muted">Start with your company name. You can add your logo, services and screenshots next, then submit for review.</p>
      <form id="create-form">
        <label for="c-name">Company name</label>
        <input id="c-name" required minlength="2" maxlength="80">
        <button class="btn btn-primary" type="submit">Create listing</button>
      </form>
    </section>`;
  main.querySelector('#create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = main.querySelector('#c-name').value.trim();
    const { error } = await supabase.from('companies').insert({ name });
    if (error) return toast(`Could not create listing: ${error.message}`, true);
    start();
  });
}

start();
