import { supabase, publicUrl, esc, toast, renderSignIn, renderUserBar } from './supabase.js';
import { renderEditor } from './editor.js';

const main = document.getElementById('main');
const userBar = document.getElementById('user-bar');
const STATUSES = ['pending', 'approved', 'draft', 'rejected', 'suspended'];
let filter = 'pending';

async function start() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    renderSignIn(main, {
      title: 'Marketplace admin',
      intro: 'OnlineHotelier team only. Sign in with the email listed as a marketplace admin.',
    });
    return;
  }
  renderUserBar(userBar, session.user);

  const { data: isAdmin } = await supabase.rpc('is_marketplace_admin');
  if (!isAdmin) {
    main.innerHTML = `<section class="card"><h1>Not an admin</h1>
      <p class="muted">${esc(session.user.email)} is not in the marketplace admin list.
      Vendors manage their listing at <a href="/vendor/">/vendor/</a>.</p></section>`;
    return;
  }

  main.innerHTML = `
    <nav class="tabs" role="tablist">
      <button class="tab active" data-tab="listings">Listings</button>
      <button class="tab" data-tab="categories">Categories</button>
    </nav>
    <div id="panel"></div>`;
  main.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
    main.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
    t.dataset.tab === 'listings' ? showListings() : showCategories();
  }));
  showListings();
}

async function showListings() {
  const panel = document.getElementById('panel');
  const { data, error } = await supabase.from('companies')
    .select('id, name, slug, status, owner_email, owner_id, logo_path, updated_at, submitted_at')
    .order('updated_at', { ascending: false });
  if (error) {
    panel.innerHTML = `<p class="error">${esc(error.message)}</p>`;
    return;
  }
  const counts = Object.fromEntries(STATUSES.map((s) => [s, data.filter((c) => c.status === s).length]));
  const rows = filter === 'all' ? data : data.filter((c) => c.status === filter);

  panel.innerHTML = `
    <section class="card">
      <h2>Add a company</h2>
      <p class="hint">Create a listing on a vendor's behalf. When they sign in at /vendor/ with this email, the listing becomes theirs to edit.</p>
      <form id="add-form" class="inline-form">
        <input id="a-name" required minlength="2" maxlength="80" placeholder="Company name" aria-label="Company name">
        <input id="a-email" type="email" placeholder="Vendor email (optional)" aria-label="Vendor email">
        <button class="btn btn-primary" type="submit">Add</button>
      </form>
    </section>

    <div class="filters">
      ${[...STATUSES, 'all'].map((s) => `<button class="chip ${s === filter ? 'active' : ''}" data-filter="${s}">
        ${s}${s === 'all' ? ` (${data.length})` : ` (${counts[s]})`}</button>`).join('')}
    </div>

    <section class="card table-card">
      ${rows.length ? `<table class="listings">
        <thead><tr><th></th><th>Company</th><th>Vendor</th><th>Status</th><th>Updated</th><th></th></tr></thead>
        <tbody>${rows.map((c) => `
          <tr>
            <td class="logo-cell">${c.logo_path ? `<img src="${esc(publicUrl(c.logo_path))}" alt="">` : ''}</td>
            <td><strong>${esc(c.name)}</strong><br><span class="muted">/${esc(c.slug)}</span></td>
            <td>${esc(c.owner_email || '—')}${c.owner_email && !c.owner_id ? '<br><span class="muted">not signed in yet</span>' : ''}</td>
            <td><span class="badge badge-${c.status}">${c.status}</span></td>
            <td class="muted">${new Date(c.updated_at).toLocaleDateString('en-IN')}</td>
            <td class="row-actions">
              ${c.status === 'pending' ? `<button class="btn btn-small btn-primary" data-set="approved" data-id="${c.id}">Approve</button>
                <button class="btn btn-small btn-secondary" data-set="rejected" data-id="${c.id}">Request changes</button>` : ''}
              <button class="btn btn-small btn-secondary" data-edit="${c.id}">Edit</button>
            </td>
          </tr>`).join('')}</tbody></table>`
        : `<p class="muted">No ${filter === 'all' ? '' : filter} listings.</p>`}
    </section>
    <div id="edit-area"></div>`;

  panel.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    showListings();
  }));

  panel.querySelector('#add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = panel.querySelector('#a-name').value.trim();
    const email = panel.querySelector('#a-email').value.trim().toLowerCase() || null;
    const { data: row, error: err } = await supabase.from('companies')
      .insert({ name, owner_email: email }).select('id').single();
    if (err) return toast(err.message, true);
    toast(`${name} added as a draft`);
    filter = 'draft';
    await showListings();
    openEditor(row.id);
  });

  panel.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', async () => {
    const patch = { status: b.dataset.set };
    if (b.dataset.set === 'rejected') {
      const note = prompt('What should the vendor change? They will see this note.');
      if (note === null) return;
      patch.admin_note = note.trim() || null;
    }
    const { error: err } = await supabase.from('companies').update(patch).eq('id', b.dataset.id);
    if (err) return toast(err.message, true);
    toast(b.dataset.set === 'approved' ? 'Approved — listing is live' : 'Sent back to vendor');
    showListings();
  }));

  panel.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openEditor(b.dataset.edit)));
}

function openEditor(id) {
  const area = document.getElementById('edit-area');
  area.innerHTML = `
    <div class="edit-head">
      <h2>Edit listing</h2>
      <div>
        <button class="btn btn-link danger" id="delete-listing">Delete listing</button>
        <button class="btn btn-secondary" id="close-edit">Close</button>
      </div>
    </div>
    <div id="editor"></div>`;
  renderEditor(area.querySelector('#editor'), id, { isAdmin: true });
  area.scrollIntoView({ behavior: 'smooth' });
  area.querySelector('#close-edit').addEventListener('click', () => { area.innerHTML = ''; showListings(); });
  area.querySelector('#delete-listing').addEventListener('click', async () => {
    if (!confirm('Delete this listing, its services and screenshots permanently?')) return;
    const { data: files } = await supabase.storage.from('marketplace').list(id);
    const { data: shots } = await supabase.storage.from('marketplace').list(`${id}/shots`);
    const paths = [
      ...(files || []).filter((f) => f.id).map((f) => `${id}/${f.name}`),
      ...(shots || []).map((f) => `${id}/shots/${f.name}`),
    ];
    if (paths.length) await supabase.storage.from('marketplace').remove(paths);
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) return toast(error.message, true);
    toast('Listing deleted');
    showListings();
  });
}

async function showCategories() {
  const panel = document.getElementById('panel');
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) {
    panel.innerHTML = `<p class="error">${esc(error.message)}</p>`;
    return;
  }
  panel.innerHTML = `
    <section class="card">
      <h2>Service categories</h2>
      <p class="hint">What vendors can tick under "Services you provide". Deleting a category removes it from every listing.</p>
      <table class="listings">
        <thead><tr><th>Name</th><th>Slug</th><th>Order</th><th></th></tr></thead>
        <tbody>${data.map((cat) => `
          <tr>
            <td><input data-name="${cat.id}" value="${esc(cat.name)}" aria-label="Name"></td>
            <td class="muted">${esc(cat.slug)}</td>
            <td><input data-order="${cat.id}" type="number" value="${cat.sort_order}" class="narrow" aria-label="Order"></td>
            <td class="row-actions">
              <button class="btn btn-small btn-secondary" data-save="${cat.id}">Save</button>
              <button class="btn btn-small btn-link danger" data-del="${cat.id}">Delete</button>
            </td>
          </tr>`).join('')}</tbody>
      </table>
      <form id="cat-form" class="inline-form">
        <input id="cat-name" required placeholder="New category name" aria-label="New category name">
        <button class="btn btn-primary" type="submit">Add category</button>
      </form>
    </section>`;

  panel.querySelector('#cat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = panel.querySelector('#cat-name').value.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const order = data.length ? Math.max(...data.map((c) => c.sort_order)) + 10 : 10;
    const { error: err } = await supabase.from('categories').insert({ name, slug, sort_order: order });
    if (err) return toast(err.message, true);
    showCategories();
  });
  panel.querySelectorAll('[data-save]').forEach((b) => b.addEventListener('click', async () => {
    const id = b.dataset.save;
    const { error: err } = await supabase.from('categories').update({
      name: panel.querySelector(`[data-name="${id}"]`).value.trim(),
      sort_order: Number(panel.querySelector(`[data-order="${id}"]`).value),
    }).eq('id', id);
    if (err) return toast(err.message, true);
    toast('Category saved');
  }));
  panel.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Delete this category from every listing?')) return;
    const { error: err } = await supabase.from('categories').delete().eq('id', b.dataset.del);
    if (err) return toast(err.message, true);
    showCategories();
  }));
}

start();
